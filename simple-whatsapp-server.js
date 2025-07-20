#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Simple group message storage
const GROUP_MESSAGES = new Map();

class WhatsAppMCP {
  constructor() {
    this.server = new Server({
      name: 'whatsapp-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_group_messages',
          description: 'Read recent messages from WhatsApp group',
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
          description: 'Send a message to WhatsApp group',
          inputSchema: {
            type: 'object',
            properties: {
              groupName: { type: 'string', description: 'Name of the WhatsApp group' },
              message: { type: 'string', description: 'Message to send' }
            },
            required: ['groupName', 'message']
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
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  readGroupMessages({ groupName, limit = 10 }) {
    // Simulate reading WhatsApp group messages - generic content
    const simulatedMessages = [
      { sender: 'Alice', message: 'Hey everyone! How is your day going?', timestamp: '2025-07-20 14:30' },
      { sender: 'Bob', message: 'Pretty good, just finished a big presentation', timestamp: '2025-07-20 14:25' },
      { sender: 'Carol', message: 'Congratulations Bob! 🎉', timestamp: '2025-07-20 14:26' },
      { sender: 'David', message: 'Anyone free for lunch tomorrow?', timestamp: '2025-07-20 13:45' },
      { sender: 'Eve', message: 'I can join! What time?', timestamp: '2025-07-20 13:50' },
      { sender: 'Frank', message: 'Count me in too', timestamp: '2025-07-20 13:52' },
      { sender: 'Grace', message: 'How about 12:30 at the usual place?', timestamp: '2025-07-20 13:55' },
      { sender: 'Henry', message: 'Perfect! See you all there', timestamp: '2025-07-20 14:00' },
      { sender: 'Ivy', message: 'Just shared some photos from yesterday', timestamp: '2025-07-20 14:10' },
      { sender: 'Jack', message: 'Thanks for sharing! Great memories', timestamp: '2025-07-20 14:15' }
    ];

    const recentMessages = simulatedMessages.slice(0, limit);
    
    // Store messages for this group
    if (!GROUP_MESSAGES.has(groupName)) {
      GROUP_MESSAGES.set(groupName, []);
    }
    GROUP_MESSAGES.get(groupName).push(...recentMessages);

    // Create clean message list
    const messagesList = recentMessages.map(msg => 
      `[${msg.timestamp}] ${msg.sender}: ${msg.message}`
    ).join('\n');

    return {
      content: [{
        type: 'text',
        text: `📱 Messages from "${groupName}" group:\n\n${messagesList}\n\n📊 Retrieved ${recentMessages.length} messages`
      }]
    };
  }

  sendGroupMessage({ groupName, message }) {
    const timestamp = new Date().toLocaleString();
    const sentMessage = {
      sender: 'You',
      message: message,
      timestamp: timestamp,
      groupName: groupName
    };

    // Store the sent message
    if (!GROUP_MESSAGES.has(groupName)) {
      GROUP_MESSAGES.set(groupName, []);
    }
    GROUP_MESSAGES.get(groupName).push(sentMessage);

    return {
      content: [{
        type: 'text',
        text: `✅ Message sent to "${groupName}":\n\n"${message}"\n\n⏰ Sent at: ${timestamp}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new WhatsAppMCP();
server.run().catch(console.error);
