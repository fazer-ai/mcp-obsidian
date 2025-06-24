import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "@/tools";
import { name, version } from "../package.json";

const server = new McpServer(
  { name, version },
  {
    instructions:
      "This is a MCP server for Obsidian. It is a simple server that can be used to run commands and get responses from the client running Local REST API community plugin.",
  },
);
registerTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`Running ${name}@${version} MCP Server on stdio`);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
