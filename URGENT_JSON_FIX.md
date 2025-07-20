# URGENT: Fix Claude Desktop JSON Errors

## The Problem
Your Claude Desktop config has invalid JSON syntax causing repeated errors.

## EXACT SOLUTION

### Step 1: Find Your Config File
**Windows**: Press `Win + R`, type this EXACTLY:
```
%APPDATA%\Claude\claude_desktop_config.json
```
Press Enter. This opens the file.

### Step 2: DELETE EVERYTHING and Replace with This EXACT Text
```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "node",
      "args": ["C:\\Users\\dhruv\\construction-mcp-server\\real-whatsapp-server.js"]
    }
  }
}
```

### Step 3: Critical Points
- Replace `dhruv` with YOUR username
- Use DOUBLE backslashes `\\` 
- NO extra commas
- NO missing quotes
- Save as UTF-8

### Step 4: Find Your Exact Path
If unsure of your path, open Command Prompt:
```cmd
cd construction-mcp-server
echo %cd%\real-whatsapp-server.js
```
Copy that EXACT path and use it.

## Alternative: Use Forward Slashes
If backslashes cause issues:
```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "node",
      "args": ["C:/Users/dhruv/construction-mcp-server/real-whatsapp-server.js"]
    }
  }
}
```

## Validate Your JSON
1. Copy your JSON
2. Go to https://jsonlint.com/
3. Paste and click "Validate JSON"
4. Fix any errors shown

## After Fixing
1. Save the file
2. Quit Claude Desktop COMPLETELY
3. Restart Claude Desktop
4. All errors should disappear

## If Still Getting Errors
Try this minimal config:
```json
{
  "mcpServers": {}
}
```

This will remove all errors. Then add back the whatsapp server once errors are gone.

The key is getting VALID JSON syntax first, then the path second.
