# Windows Integration Fix

## The Issue
You're using the placeholder path instead of your actual file path.

## Quick Fix

1. **Find where you cloned the repository**. If you cloned it to your user directory, it's likely:
   ```
   C:\Users\dhruv\construction-mcp-server
   ```

2. **Update your Claude Desktop config** with the correct path:

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

## Find Your Exact Path

Open Command Prompt and run:
```cmd
cd construction-mcp-server
echo %cd%\server.js
```

This will show your exact path. Copy that path and use it in the config.

## Alternative: Use PowerShell
```powershell
cd construction-mcp-server
Write-Host "$(Get-Location)\server.js"
```

## Verify File Exists
```cmd
dir "C:\Users\dhruv\construction-mcp-server\server.js"
```

If the file exists, you'll see its details. If not, navigate to where you actually cloned it.

## Updated Config Example
```json
{
  "mcpServers": {
    "construction": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:\\Users\\dhruv\\construction-mcp-server\\server.js"]
    }
  }
}
```

Note: Double backslashes `\\` are required in JSON files on Windows.
