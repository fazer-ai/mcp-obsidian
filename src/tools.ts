import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import config from "@/config";
import { Obsidian } from "@/obsidian";

const obsidian = new Obsidian(config.obsidian);

export function registerTools(server: McpServer) {
  server.tool(
    "obsidian_status",
    "Returns basic details about the server.",
    async () => {
      const status = await obsidian.status();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(status),
          },
        ],
      };
    },
  );

  server.tool(
    "obsidian_delete_active",
    "Deletes the currently-active file.",
    async () => {
      await obsidian.deleteActive();
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_get_active",
    "Returns the content of the currently-active file.",
    async () => {
      const note = await obsidian.getActive();
      return {
        content: [{ type: "text", text: JSON.stringify(note) }],
      };
    },
  );

  server.tool(
    "obsidian_patch_active",
    "Inserts content into the active file relative to a target.",
    {
      operation: z.enum(["append", "prepend", "replace"]),
      targetType: z.enum(["heading", "block", "frontmatter"]),
      target: z.string(),
      content: z.string(),
      trimTargetWhitespace: z.boolean().optional(),
      targetDelimiter: z.string().optional(),
      contentType: z.string().optional(),
    },
    async (args) => {
      const res = await obsidian.patchActive(args);
      return {
        content: [{ type: "text", text: JSON.stringify(res) }],
      };
    },
  );

  server.tool(
    "obsidian_post_active",
    "Appends content to the active file.",
    { content: z.string() },
    async (args) => {
      await obsidian.postActive(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_put_active",
    "Replaces content of the active file.",
    { content: z.string() },
    async (args) => {
      await obsidian.putActive(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_get_commands",
    "Returns a list of available commands.",
    async () => {
      const commands = await obsidian.getCommands();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(commands),
          },
        ],
      };
    },
  );

  server.tool(
    "obsidian_execute_command",
    "Executes a specified command.",
    { commandId: z.string() },
    async (args) => {
      await obsidian.executeCommand(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_open_file",
    "Opens a file, optionally in a new leaf.",
    { filename: z.string(), newLeaf: z.boolean().nullish() },
    async (args) => {
      await obsidian.openFile(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_delete_periodic",
    "Deletes the periodic note for a given period.",
    {
      period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
    },
    async (args) => {
      await obsidian.deletePeriodic(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_get_periodic",
    "Returns the periodic note for a given period.",
    {
      period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
    },
    async (args) => {
      const note = await obsidian.getPeriodic(args);
      return {
        content: [{ type: "text", text: JSON.stringify(note) }],
      };
    },
  );

  server.tool(
    "obsidian_patch_periodic",
    "Inserts content into a periodic note relative to a target.",
    {
      period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
      operation: z.enum(["append", "prepend", "replace"]),
      targetType: z.enum(["heading", "block", "frontmatter"]),
      target: z.string(),
      content: z.string(),
      trimTargetWhitespace: z.boolean().optional(),
      targetDelimiter: z.string().optional(),
      contentType: z.string().optional(),
    },
    async (args) => {
      await obsidian.patchPeriodic(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_post_periodic",
    "Appends content to the periodic note.",
    {
      period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
      content: z.string(),
    },
    async (args) => {
      await obsidian.postPeriodic(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_put_periodic",
    "Replaces content of the periodic note.",
    {
      period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
      content: z.string(),
    },
    async (args) => {
      await obsidian.putPeriodic(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_search_dataview",
    "Searches using a Dataview query.",
    { query: z.string() },
    async (args) => {
      const results = await obsidian.searchDataview(args);
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      };
    },
  );

  server.tool(
    "obsidian_search_json_logic",
    "Searches using a JsonLogic query.",
    { logic: z.unknown() },
    async ({ logic }) => {
      const results = await obsidian.searchJsonLogic(logic);
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      };
    },
  );

  server.tool(
    "obsidian_simple_search",
    "Searches for text in vault with optional context.",
    { query: z.string(), contextLength: z.number().optional() },
    async (args) => {
      const results = await obsidian.simpleSearch(args);
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      };
    },
  );

  server.tool(
    "obsidian_list_vault_root",
    "Lists files in the root of the vault.",
    async () => {
      const files = await obsidian.listVaultRoot();
      return {
        content: [{ type: "text", text: JSON.stringify(files) }],
      };
    },
  );

  server.tool(
    "obsidian_list_vault_directory",
    "Lists files in a specified directory.",
    { pathToDirectory: z.string() },
    async (args) => {
      const files = await obsidian.listVaultDirectory(args);
      return {
        content: [{ type: "text", text: JSON.stringify(files) }],
      };
    },
  );

  server.tool(
    "obsidian_delete_file",
    "Deletes a file in the vault.",
    { filename: z.string() },
    async (args) => {
      await obsidian.deleteFile(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_get_file",
    "Returns content of a vault file.",
    { filename: z.string() },
    async (args) => {
      const file = await obsidian.getFile(args);
      return {
        content: [{ type: "text", text: JSON.stringify(file) }],
      };
    },
  );

  server.tool(
    "obsidian_patch_file",
    "Inserts content into a vault file relative to a target.",
    {
      filename: z.string(),
      operation: z.enum(["append", "prepend", "replace"]),
      targetType: z.enum(["heading", "block", "frontmatter"]),
      target: z.string(),
      content: z.string(),
      trimTargetWhitespace: z.boolean().optional(),
      targetDelimiter: z.string().optional(),
      contentType: z.string().optional(),
    },
    async (args) => {
      await obsidian.patchFile(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_post_file",
    "Appends content to a vault file.",
    { filename: z.string(), content: z.string() },
    async (args) => {
      await obsidian.postFile(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );

  server.tool(
    "obsidian_put_file",
    "Creates or replaces a vault file.",
    { filename: z.string(), content: z.string() },
    async (args) => {
      await obsidian.putFile(args);
      return {
        content: [{ type: "text", text: "OK" }],
      };
    },
  );
}
