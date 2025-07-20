#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Ultra-light construction calculations
const MATERIALS = {
  concrete: { density: 2400, unit: 'kg/m³', cost: 120 }, // per m³
  steel: { density: 7850, unit: 'kg/m³', cost: 800 },
  brick: { density: 1800, unit: 'kg/m³', cost: 0.5 }, // per piece
  cement: { density: 1440, unit: 'kg/m³', cost: 180 }
};

class ConstructionMCP {
  constructor() {
    this.server = new Server({
      name: 'construction-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
  }

  setupTools() {
    // Material calculator
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
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
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  calculateMaterials({ structure, dimensions }) {
    const { length, width, height } = dimensions;
    const volume = length * width * height;
    
    const calculations = {
      foundation: {
        concrete: volume * 0.8, // 80% concrete
        steel: volume * 80, // kg reinforcement
        description: `Foundation: ${volume.toFixed(2)}m³ total volume`
      },
      wall: {
        brick: Math.ceil(volume * 500), // pieces
        cement: volume * 0.3,
        description: `Wall: ${Math.ceil(volume * 500)} bricks needed`
      },
      slab: {
        concrete: volume,
        steel: volume * 100, // kg
        description: `Slab: ${volume.toFixed(2)}m³ concrete`
      },
      beam: {
        concrete: volume,
        steel: volume * 150, // kg
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new ConstructionMCP();
server.run().catch(console.error);
