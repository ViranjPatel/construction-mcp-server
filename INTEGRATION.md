# Claude Desktop Integration Guide

## Step 1: Install Dependencies

```bash
git clone https://github.com/ViranjPatel/construction-mcp-server.git
cd construction-mcp-server
npm install
```

## Step 2: Locate Claude Desktop Config

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## Step 3: Add MCP Server Configuration

Open the config file and add your construction server:

```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["/absolute/path/to/construction-mcp-server/server.js"]
    }
  }
}
```

**Replace `/absolute/path/to/construction-mcp-server/` with your actual path!**

### Example Configurations:

**macOS/Linux**:
```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["/Users/yourname/construction-mcp-server/server.js"]
    }
  }
}
```

**Windows**:
```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["C:\\Users\\yourname\\construction-mcp-server\\server.js"]
    }
  }
}
```

## Step 4: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Restart the application
3. Look for the 🔧 hammer icon in the chat interface

## Step 5: Test Your Integration

Try these commands in Claude Desktop:

```
Calculate materials needed for a foundation that's 12m x 8m x 0.6m
```

```
Estimate the cost of 50 cubic meters of concrete
```

```
How much steel reinforcement do I need for a beam 10m x 0.3m x 0.5m?
```

## Troubleshooting

### Server Not Appearing?
- Check the file path is absolute and correct
- Ensure Node.js is in your PATH
- Verify the JSON syntax is valid (use a JSON validator)

### Permission Issues?
```bash
chmod +x server.js
```

### Node.js Not Found?
Add the full Node.js path:
```json
{
  "mcpServers": {
    "construction": {
      "command": "/usr/local/bin/node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

## Success Indicators

✅ **Hammer icon (🔧)** appears in Claude Desktop
✅ **Construction tools** show up when you ask about materials
✅ **Instant calculations** for concrete, steel, brick quantities
✅ **Cost estimates** with real-time responses

## Advanced Usage

Once integrated, you can ask Claude things like:
- "Plan materials for a 2-story house foundation"
- "Compare costs between concrete and brick walls"
- "Calculate total project costs for these dimensions"

Claude will automatically use your construction tools to provide accurate calculations!
