# Fix Claude Desktop JSON Errors

## The Problem
You're getting "Unexpected token" and "not valid JSON" errors in Claude Desktop. This means there's a syntax error in your `claude_desktop_config.json` file.

## Quick Fix

### Step 1: Find Your Config File
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Step 2: Replace Entire Config Content
Open the file and replace ALL content with this exact JSON:

```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["C:\\Users\\dhruv\\construction-mcp-server\\server.js"]
    }
  }
}
```

### Step 3: Important Notes
- Use **double backslashes** `\\` in Windows paths
- Replace `dhruv` with your actual username
- Make sure there are **no extra commas** or **missing quotes**
- Save the file as **UTF-8 encoding**

### Step 4: Validate JSON (Optional)
Copy the JSON and paste it into https://jsonlint.com/ to check for errors.

## Common JSON Mistakes

❌ **Wrong:**
```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["C:\Users\dhruv\path\server.js"],  // Single backslash
    }  // Extra comma
  }
}
```

✅ **Correct:**
```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["C:\\Users\\dhruv\\construction-mcp-server\\server.js"]
    }
  }
}
```

## Alternative: Use Forward Slashes
```json
{
  "mcpServers": {
    "construction": {
      "command": "node",
      "args": ["C:/Users/dhruv/construction-mcp-server/server.js"]
    }
  }
}
```

## After Fixing
1. **Save the file**
2. **Quit Claude Desktop completely**
3. **Restart Claude Desktop**
4. **Check for errors** - they should be gone!

The JSON errors will disappear once the config file has valid syntax.
