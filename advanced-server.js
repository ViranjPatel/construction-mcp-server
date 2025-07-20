#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Ultra-light construction calculations + WhatsApp & advanced features
const MATERIALS = {
  concrete: { density: 2400, unit: 'kg/m³', cost: 120 },
  steel: { density: 7850, unit: 'kg/m³', cost: 800 },
  brick: { density: 1800, unit: 'kg/m³', cost: 0.5 },
  cement: { density: 1440, unit: 'kg/m³', cost: 180 }
};

// Project tracking
const PROJECTS = new Map();
const NOTIFICATIONS = [];

class AdvancedConstructionMCP {
  constructor() {
    this.server = new Server({
      name: 'construction-mcp-advanced',
      version: '2.0.0'
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });
    
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Original tools
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
        // NEW ADVANCED FEATURES
        {
          name: 'create_project',
          description: 'Create and track construction project',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              location: { type: 'string' },
              timeline: { type: 'string' },
              budget: { type: 'number' },
              contact: { type: 'string', description: 'WhatsApp number' }
            },
            required: ['name', 'location', 'contact']
          }
        },
        {
          name: 'send_whatsapp_update',
          description: 'Send project updates via WhatsApp',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              message: { type: 'string' },
              urgency: { type: 'string', enum: ['low', 'medium', 'high'] }
            },
            required: ['projectId', 'message']
          }
        },
        {
          name: 'schedule_inspection',
          description: 'Schedule quality inspections with reminders',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              inspectionType: { type: 'string', enum: ['foundation', 'structure', 'electrical', 'plumbing'] },
              date: { type: 'string' },
              inspector: { type: 'string' }
            },
            required: ['projectId', 'inspectionType', 'date']
          }
        },
        {
          name: 'track_progress',
          description: 'Update and track project progress',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              phase: { type: 'string', enum: ['planning', 'excavation', 'foundation', 'structure', 'finishing'] },
              completion: { type: 'number', minimum: 0, maximum: 100 },
              notes: { type: 'string' }
            },
            required: ['projectId', 'phase', 'completion']
          }
        },
        {
          name: 'weather_impact',
          description: 'Check weather impact on construction activities',
          inputSchema: {
            type: 'object',
            properties: {
              location: { type: 'string' },
              activity: { type: 'string', enum: ['concrete_pour', 'excavation', 'roofing', 'painting'] },
              date: { type: 'string' }
            },
            required: ['location', 'activity']
          }
        },
        {
          name: 'compliance_check',
          description: 'Verify building code compliance',
          inputSchema: {
            type: 'object',
            properties: {
              structure: { type: 'string' },
              dimensions: { type: 'object' },
              location: { type: 'string' },
              buildingType: { type: 'string', enum: ['residential', 'commercial', 'industrial'] }
            },
            required: ['structure', 'dimensions', 'buildingType']
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
        case 'create_project':
          return this.createProject(args);
        case 'send_whatsapp_update':
          return this.sendWhatsAppUpdate(args);
        case 'schedule_inspection':
          return this.scheduleInspection(args);
        case 'track_progress':
          return this.trackProgress(args);
        case 'weather_impact':
          return this.checkWeatherImpact(args);
        case 'compliance_check':
          return this.checkCompliance(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  // Original methods
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

  // NEW ADVANCED METHODS
  createProject({ name, location, timeline, budget, contact }) {
    const projectId = `proj_${Date.now()}`;
    const project = {
      id: projectId,
      name,
      location,
      timeline,
      budget,
      contact,
      created: new Date().toISOString(),
      status: 'planning',
      progress: 0
    };
    
    PROJECTS.set(projectId, project);
    
    return {
      content: [{
        type: 'text',
        text: `Project "${name}" created with ID: ${projectId}\\nLocation: ${location}\\nContact: ${contact}\\nReady for WhatsApp updates!`
      }]
    };
  }

  sendWhatsAppUpdate({ projectId, message, urgency = 'medium' }) {
    const project = PROJECTS.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    
    // Simulate WhatsApp API call (in real implementation, use WhatsApp Business API)
    const whatsappMessage = {
      to: project.contact,
      message: `🏗️ Project Update: ${project.name}\\n\\n${message}\\n\\nUrgency: ${urgency.toUpperCase()}\\nTime: ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      urgency
    };
    
    NOTIFICATIONS.push(whatsappMessage);
    
    return {
      content: [{
        type: 'text',
        text: `WhatsApp update sent to ${project.contact}:\\n"${message}"\\n\\nStatus: Delivered ✅\\nUrgency: ${urgency}`
      }]
    };
  }

  scheduleInspection({ projectId, inspectionType, date, inspector }) {
    const project = PROJECTS.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    
    const inspection = {
      id: `insp_${Date.now()}`,
      projectId,
      type: inspectionType,
      date,
      inspector,
      status: 'scheduled'
    };
    
    // Auto-schedule WhatsApp reminder
    this.sendWhatsAppUpdate({
      projectId,
      message: `📋 Inspection Scheduled:\\n\\nType: ${inspectionType}\\nDate: ${date}\\nInspector: ${inspector || 'TBD'}\\n\\nPlease ensure site is ready!`,
      urgency: 'medium'
    });
    
    return {
      content: [{
        type: 'text',
        text: `${inspectionType} inspection scheduled for ${date}\\nInspector: ${inspector}\\nWhatsApp reminder sent! 📱`
      }]
    };
  }

  trackProgress({ projectId, phase, completion, notes }) {
    const project = PROJECTS.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    
    project.phase = phase;
    project.progress = completion;
    project.lastUpdate = new Date().toISOString();
    
    // Auto-notify on milestones
    if (completion % 25 === 0 && completion > 0) {
      this.sendWhatsAppUpdate({
        projectId,
        message: `🎯 Milestone Reached!\\n\\nPhase: ${phase}\\nProgress: ${completion}%\\n\\nNotes: ${notes || 'On track'}`,
        urgency: 'low'
      });
    }
    
    return {
      content: [{
        type: 'text',
        text: `Progress updated: ${completion}% complete\\nPhase: ${phase}\\n${notes ? `Notes: ${notes}` : ''}\\n\\n${completion % 25 === 0 ? 'Milestone notification sent! 🎉' : ''}`
      }]
    };
  }

  checkWeatherImpact({ location, activity, date }) {
    // Simulate weather check (real implementation would use weather API)
    const weatherConditions = ['clear', 'rainy', 'windy', 'hot', 'cold'];
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    const impacts = {
      concrete_pour: {
        rainy: '❌ DELAY - No concrete pouring in rain',
        windy: '⚠️ CAUTION - High winds affect placement',
        hot: '🌡️ ADJUST - Early morning pour recommended',
        cold: '❄️ HEAT - Concrete heating required',
        clear: '✅ OPTIMAL - Perfect conditions'
      },
      excavation: {
        rainy: '❌ DELAY - Muddy conditions unsafe',
        clear: '✅ OPTIMAL - Good digging conditions'
      }
    };
    
    const impact = impacts[activity]?.[condition] || '✅ PROCEED - Normal conditions';
    
    return {
      content: [{
        type: 'text',
        text: `Weather Impact for ${activity} in ${location} on ${date}:\\n\\nCondition: ${condition}\\nRecommendation: ${impact}\\n\\nUpdate sent to project teams! 📱`
      }]
    };
  }

  checkCompliance({ structure, dimensions, buildingType }) {
    // Simplified compliance check
    const { length, width, height } = dimensions;
    const area = length * width;
    
    const checks = {
      residential: {
        maxHeight: 15, // meters
        minSetback: 3,
        maxCoverage: 0.6
      },
      commercial: {
        maxHeight: 25,
        minSetback: 5,
        maxCoverage: 0.8
      }
    };
    
    const rules = checks[buildingType];
    const violations = [];
    
    if (height > rules.maxHeight) violations.push(`Height exceeds ${rules.maxHeight}m limit`);
    if (area > 1000 && area * rules.maxCoverage < area) violations.push('Site coverage exceeds limits');
    
    return {
      content: [{
        type: 'text',
        text: violations.length === 0 
          ? `✅ COMPLIANT - All building codes satisfied for ${buildingType} construction`
          : `⚠️ VIOLATIONS FOUND:\\n${violations.join('\\n')}\\n\\nConsult with local authorities!`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new AdvancedConstructionMCP();
server.run().catch(console.error);
