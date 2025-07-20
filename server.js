#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Ultra-light construction calculations + WhatsApp group integration
const MATERIALS = {
  concrete: { density: 2400, unit: 'kg/m³', cost: 120 },
  steel: { density: 7850, unit: 'kg/m³', cost: 800 },
  brick: { density: 1800, unit: 'kg/m³', cost: 0.5 },
  cement: { density: 1440, unit: 'kg/m³', cost: 180 }
};

// WhatsApp group storage
const GROUP_MESSAGES = [];
const GROUP_CONFIG = {
  groupId: null,
  lastMessageId: null
};

class ConstructionMCP {
  constructor() {
    this.server = new Server({
      name: 'construction-mcp',
      version: '1.1.0'
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
        // WhatsApp group tools
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
        case 'calculate_materials':
          return this.calculateMaterials(args);
        case 'estimate_cost':
          return this.estimateCost(args);
        case 'read_group_messages':
          return this.readGroupMessages(args);
        case 'send_group_message':
          return this.sendGroupMessage(args);
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

  // WhatsApp group methods
  readGroupMessages({ groupName, limit = 10 }) {
    // Simulate reading WhatsApp group messages
    // In real implementation, this would connect to WhatsApp Web API or Business API
    
    const simulatedMessages = [
      { sender: 'Site Engineer', message: 'Foundation work completed today', timestamp: '2025-07-20 14:30' },
      { sender: 'Project Manager', message: 'Need 50 bags of cement tomorrow', timestamp: '2025-07-20 14:25' },
      { sender: 'Contractor', message: 'Rebar delivery delayed by 2 hours', timestamp: '2025-07-20 13:45' },
      { sender: 'Supervisor', message: 'Quality check passed for concrete', timestamp: '2025-07-20 13:20' },
      { sender: 'Worker', message: 'Equipment maintenance required', timestamp: '2025-07-20 12:50' }
    ];

    const recentMessages = simulatedMessages.slice(0, limit);
    GROUP_MESSAGES.push(...recentMessages);

    const messagesList = recentMessages.map(msg => 
      `[${msg.timestamp}] ${msg.sender}: ${msg.message}`
    ).join('\n');

    return {
      content: [{
        type: 'text',
        text: `📱 Recent messages from "${groupName}" group:\n\n${messagesList}\n\n✅ ${recentMessages.length} messages retrieved`
      }]
    };
  }

  sendGroupMessage({ groupName, message }) {
    // Simulate sending message to WhatsApp group
    // In real implementation, this would use WhatsApp Business API
    
    const timestamp = new Date().toLocaleString();
    const sentMessage = {
      sender: 'Construction Bot',
      message: message,
      timestamp: timestamp,
      groupName: groupName
    };

    GROUP_MESSAGES.push(sentMessage);

    return {
      content: [{
        type: 'text',
        text: `✅ Message sent to "${groupName}" group:\n\n"${message}"\n\nSent at: ${timestamp}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new ConstructionMCP();
server.run().catch(console.error);
