#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

// Ultra-light construction calculations
const MATERIALS = {
  concrete: { density: 2400, unit: 'kg/m³', cost: 120 },
  steel: { density: 7850, unit: 'kg/m³', cost: 800 },
  brick: { density: 1800, unit: 'kg/m³', cost: 0.5 },
  cement: { density: 1440, unit: 'kg/m³', cost: 180 }
};

// WhatsApp client
let whatsappClient = null;
let isWhatsAppReady = false;

class ConstructionMCP {
  constructor() {
    this.server = new Server({
      name: 'construction-mcp',
      version: '1.2.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
    this.initWhatsApp();
  }

  async initWhatsApp() {
    try {
      whatsappClient = new Client({
        authStrategy: new LocalAuth({
          clientId: 'construction-mcp'
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      whatsappClient.on('qr', (qr) => {
        console.log('🔗 WhatsApp QR Code - Scan with your phone:');
        qrcode.generate(qr, { small: true });
      });

      whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp Client is ready!');
        isWhatsAppReady = true;
      });

      whatsappClient.on('authenticated', () => {
        console.log('🔐 WhatsApp authenticated successfully');
      });

      whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp authentication failed:', msg);
      });

      await whatsappClient.initialize();
    } catch (error) {
      console.error('❌ WhatsApp initialization failed:', error.message);
    }
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Original construction tools
        {
          name: 'calculate_materials',
          description: 'Calculate construction materials needed for basic structures',
          inputSchema: {
            type: 'object',
            properties: {
              structure: { type: 'string', enum: ['foundation', 'wall', 'slab', 'beam'] },
              dimensions: {
                type: 'object',
                properties: {
                  length: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' }
                },
                required: ['length', 'width', 'height']
              }
            },
            required: ['structure', 'dimensions']
          }
        },
        {
          name: 'estimate_cost',
          description: 'Quick cost estimation for materials',
          inputSchema: {
            type: 'object',
            properties: {
              material: { type: 'string', enum: Object.keys(MATERIALS) },
              quantity: { type: 'number' },
              unit: { type: 'string', enum: ['m³', 'pieces'] }
            },
            required: ['material', 'quantity']
          }
        },
        // Real WhatsApp tools
        {
          name: 'read_group_messages',
          description: 'Read recent messages from your actual WhatsApp group',
          inputSchema: {
            type: 'object',
            properties: {
              groupName: { type: 'string', description: 'Name of the WhatsApp group' },
              limit: { type: 'number', default: 10, description: 'Number of recent messages to read' }
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
              groupName: { type: 'string', description: 'Name of the WhatsApp group' },
              message: { type: 'string', description: 'Message to send' }
            },
            required: ['groupName', 'message']
          }
        },
        {
          name: 'list_groups',
          description: 'List all your WhatsApp groups',
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
        case 'calculate_materials':
          return this.calculateMaterials(args);
        case 'estimate_cost':
          return this.estimateCost(args);
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

  // Original construction methods
  calculateMaterials({ structure, dimensions }) {
    const { length, width, height } = dimensions;
    const volume = length * width * height;
    
    const calculations = {
      foundation: {
        concrete: volume * 0.8,
        steel: volume * 80,
        description: `Foundation: ${volume.toFixed(2)}m³ total volume`
      },
      wall: {
        brick: Math.ceil(volume * 500),
        cement: volume * 0.3,
        description: `Wall: ${Math.ceil(volume * 500)} bricks needed`
      },
      slab: {
        concrete: volume,
        steel: volume * 100,
        description: `Slab: ${volume.toFixed(2)}m³ concrete`
      },
      beam: {
        concrete: volume,
        steel: volume * 150,
        description: `Beam: High steel ratio for structural integrity`
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(calculations[structure], null, 2)
      }]
    };
  }

  estimateCost({ material, quantity, unit = 'm³' }) {
    const mat = MATERIALS[material];
    if (!mat) throw new Error(`Unknown material: ${material}`);
    
    const cost = unit === 'pieces' ? quantity * mat.cost : quantity * mat.cost;
    
    return {
      content: [{
        type: 'text',
        text: `${material}: ${quantity} ${unit} = $${cost.toFixed(2)}`
      }]
    };
  }

  // Real WhatsApp methods
  async listGroups() {
    if (!isWhatsAppReady) {
      return {
        content: [{
          type: 'text',
          text: '❌ WhatsApp not connected. Please scan QR code first.'
        }]
      };
    }

    try {
      const chats = await whatsappClient.getChats();
      const groups = chats.filter(chat => chat.isGroup);
      
      const groupList = groups.map(group => 
        `📱 ${group.name} (${group.participants.length} members)`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `🔍 Your WhatsApp Groups:\n\n${groupList}\n\n✅ Found ${groups.length} groups`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error listing groups: ${error.message}`
        }]
      };
    }
  }

  async readGroupMessages({ groupName, limit = 10 }) {
    if (!isWhatsAppReady) {
      return {
        content: [{
          type: 'text',
          text: '❌ WhatsApp not connected. Please scan QR code first.'
        }]
      };
    }

    try {
      const chats = await whatsappClient.getChats();
      const group = chats.find(chat => chat.isGroup && chat.name === groupName);
      
      if (!group) {
        return {
          content: [{
            type: 'text',
            text: `❌ Group "${groupName}" not found. Use list_groups to see available groups.`
          }]
        };
      }

      const messages = await group.fetchMessages({ limit });
      const messagesList = messages.reverse().map(msg => {
        const timestamp = new Date(msg.timestamp * 1000).toLocaleString();
        const contact = msg.author ? msg.author.replace('@c.us', '') : 'System';
        return `[${timestamp}] ${contact}: ${msg.body}`;
      }).join('\n');

      return {
        content: [{
          type: 'text',
          text: `📱 Recent messages from "${groupName}":\n\n${messagesList}\n\n✅ ${messages.length} messages retrieved`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error reading messages: ${error.message}`
        }]
      };
    }
  }

  async sendGroupMessage({ groupName, message }) {
    if (!isWhatsAppReady) {
      return {
        content: [{
          type: 'text',
          text: '❌ WhatsApp not connected. Please scan QR code first.'
        }]
      };
    }

    try {
      const chats = await whatsappClient.getChats();
      const group = chats.find(chat => chat.isGroup && chat.name === groupName);
      
      if (!group) {
        return {
          content: [{
            type: 'text',
            text: `❌ Group "${groupName}" not found. Use list_groups to see available groups.`
          }]
        };
      }

      await group.sendMessage(message);
      const timestamp = new Date().toLocaleString();

      return {
        content: [{
          type: 'text',
          text: `✅ Message sent to "${groupName}":\n\n"${message}"\n\nSent at: ${timestamp}`
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

const server = new ConstructionMCP();
server.run().catch(console.error);
