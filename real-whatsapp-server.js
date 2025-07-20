#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

// Real WhatsApp client
let whatsappClient = null;
let isWhatsAppReady = false;

class RealWhatsAppMCP {
  constructor() {
    this.server = new Server({
      name: 'real-whatsapp-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
    this.initWhatsApp();
  }

  async initWhatsApp() {
    console.log('🔄 Initializing WhatsApp connection...');
    
    try {
      whatsappClient = new Client({
        authStrategy: new LocalAuth({
          clientId: 'real-whatsapp-mcp'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      whatsappClient.on('qr', (qr) => {
        console.log('\n🔗 SCAN THIS QR CODE WITH YOUR PHONE:');
        console.log('Open WhatsApp → Settings → Linked Devices → Link a Device\n');
        qrcode.generate(qr, { small: true });
      });

      whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp Client is ready! You can now use it with Claude.');
        isWhatsAppReady = true;
      });

      whatsappClient.on('authenticated', () => {
        console.log('🔐 WhatsApp authenticated successfully');
      });

      whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp authentication failed:', msg);
      });

      whatsappClient.on('disconnected', (reason) => {
        console.log('📱 WhatsApp disconnected:', reason);
        isWhatsAppReady = false;
      });

      await whatsappClient.initialize();
    } catch (error) {
      console.error('❌ WhatsApp initialization failed:', error.message);
    }
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_group_messages',
          description: 'Read and summarize recent messages from your actual WhatsApp group',
          inputSchema: {
            type: 'object',
            properties: {
              groupName: { type: 'string', description: 'Name of your WhatsApp group' },
              limit: { type: 'number', default: 20, description: 'Number of recent messages to read (max 50)' }
            },
            required: ['groupName']
          }
        },
        {
          name: 'send_group_message',
          description: 'Send a message to your actual WhatsApp group',
          inputSchema: {
            type: 'object',
            properties: {
              groupName: { type: 'string', description: 'Name of your WhatsApp group' },
              message: { type: 'string', description: 'Message to send' }
            },
            required: ['groupName', 'message']
          }
        },
        {
          name: 'list_groups',
          description: 'List all your actual WhatsApp groups',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'read_group_messages':
          return this.readGroupMessages(args);
        case 'send_group_message':
          return this.sendGroupMessage(args);
        case 'list_groups':
          return this.listGroups();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async listGroups() {
    if (!isWhatsAppReady) {
      return {
        content: [{
          type: 'text',
          text: '❌ WhatsApp not connected. Please scan the QR code first.\n\nRun: node real-whatsapp-server.js\nThen scan the QR code with your phone.'
        }]
      };
    }

    try {
      console.log('📋 Fetching your WhatsApp groups...');
      const chats = await whatsappClient.getChats();
      const groups = chats.filter(chat => chat.isGroup);
      
      if (groups.length === 0) {
        return {
          content: [{
            type: 'text',
            text: '📱 No WhatsApp groups found in your account.'
          }]
        };
      }

      const groupList = groups.map((group, index) => 
        `${index + 1}. ${group.name} (${group.participants.length} members)`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `📱 Your WhatsApp Groups:\n\n${groupList}\n\n✅ Found ${groups.length} groups`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error fetching groups: ${error.message}`
        }]
      };
    }
  }

  async readGroupMessages({ groupName, limit = 20 }) {
    if (!isWhatsAppReady) {
      return {
        content: [{
          type: 'text',
          text: '❌ WhatsApp not connected. Please scan the QR code first.\n\nRun: node real-whatsapp-server.js\nThen scan the QR code with your phone.'
        }]
      };
    }

    try {
      console.log(`📖 Reading messages from "${groupName}"...`);
      
      const chats = await whatsappClient.getChats();
      const group = chats.find(chat => chat.isGroup && chat.name.toLowerCase().includes(groupName.toLowerCase()));
      
      if (!group) {
        const availableGroups = chats.filter(chat => chat.isGroup).map(g => g.name).join(', ');
        return {
          content: [{
            type: 'text',
            text: `❌ Group "${groupName}" not found.\n\nAvailable groups: ${availableGroups}\n\nTip: Try using partial names (e.g., "family" instead of "Family Group 2024")`
          }]
        };
      }

      // Fetch real messages from YOUR group
      const messages = await group.fetchMessages({ limit: Math.min(limit, 50) });
      
      if (messages.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📱 No recent messages found in "${group.name}"`
          }]
        };
      }

      // Process real messages
      const realMessages = messages.reverse().map(msg => {
        const timestamp = new Date(msg.timestamp * 1000).toLocaleString();
        let senderName = 'System';
        
        if (msg.author) {
          // Try to get contact name, fallback to phone number
          const contact = msg.getContact ? msg.getContact() : null;
          senderName = contact?.name || contact?.pushname || msg.author.replace('@c.us', '');
        }
        
        return {
          timestamp,
          sender: senderName,
          message: msg.body || '[Media/Attachment]',
          type: msg.type
        };
      });

      // Create clean output for Claude to summarize
      const messageText = realMessages.map(msg => 
        `[${msg.timestamp}] ${msg.sender}: ${msg.message}`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `📱 Real messages from "${group.name}" group:\n\n${messageText}\n\n📊 Retrieved ${realMessages.length} actual messages\n\n💡 You can now ask me to summarize these messages or analyze the conversation.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error reading messages: ${error.message}\n\nTip: Make sure the group name is correct. Use 'list_groups' to see available groups.`
        }]
      };
    }
  }

  async sendGroupMessage({ groupName, message }) {
    if (!isWhatsAppReady) {
      return {
        content: [{
          type: 'text',
          text: '❌ WhatsApp not connected. Please scan the QR code first.'
        }]
      };
    }

    try {
      console.log(`📤 Sending message to "${groupName}"...`);
      
      const chats = await whatsappClient.getChats();
      const group = chats.find(chat => chat.isGroup && chat.name.toLowerCase().includes(groupName.toLowerCase()));
      
      if (!group) {
        return {
          content: [{
            type: 'text',
            text: `❌ Group "${groupName}" not found. Use 'list_groups' to see available groups.`
          }]
        };
      }

      // Send real message to YOUR group
      await group.sendMessage(message);
      const timestamp = new Date().toLocaleString();

      return {
        content: [{
          type: 'text',
          text: `✅ Message sent to "${group.name}":\n\n"${message}"\n\n⏰ Sent at: ${timestamp}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error sending message: ${error.message}`
        }]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new RealWhatsAppMCP();
server.run().catch(console.error);

// Keep the process alive
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down WhatsApp client...');
  if (whatsappClient) {
    await whatsappClient.destroy();
  }
  process.exit(0);
});
