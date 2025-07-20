# Construction MCP Server

Ultra-lightweight MCP server for construction calculations and material estimation.

## Features
- **Material Calculator**: Calculate concrete, steel, brick requirements
- **Cost Estimator**: Quick material cost calculations
- **Structure Types**: Foundation, walls, slabs, beams

## Quick Start

```bash
npm install
npm start
```

## Tools Available

### calculate_materials
Calculate materials for construction elements:
```json
{
  "structure": "foundation",
  "dimensions": {
    "length": 10,
    "width": 8,
    "height": 0.5
  }
}
```

### estimate_cost
Estimate material costs:
```json
{
  "material": "concrete",
  "quantity": 40,
  "unit": "m³"
}
```

## Architecture

- **Zero dependencies** beyond MCP SDK
- **In-memory calculations** - no database overhead
- **Stateless design** for maximum performance
- **JSON-based** material database

## Material Database

| Material | Density | Cost/Unit |
|----------|---------|-----------|
| Concrete | 2400 kg/m³ | $120/m³ |
| Steel | 7850 kg/m³ | $800/m³ |
| Brick | 1800 kg/m³ | $0.5/piece |
| Cement | 1440 kg/m³ | $180/m³ |

## Performance Notes

- **Sub-millisecond** calculation responses
- **Minimal memory footprint** (~10MB)
- **No external API calls**
- **Pure computation** - no I/O blocking

## Usage Example

Connect to Claude Desktop by adding to your config:

```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["path/to/construction-mcp-server/server.js"]
    }
  }
}
```
