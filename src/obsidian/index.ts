import { sanitizeAndEncodePath } from "@/obsidian/helpers";
import type {
  CommandsResponse,
  ErrorResponse,
  ListFilesResponse,
  NoteJson,
  ObsidianOptions,
  PatchActiveOptions,
  PatchFileOptions,
  PatchPeriodOptions,
  Period,
  SearchResult,
  SimpleSearchResponse,
  StatusResponse,
} from "@/obsidian/types";

export class Obsidian {
  private apiKey: string;
  private protocol: "http" | "https";
  private host: string;
  private port: number;

  constructor({ apiKey, protocol, host, port }: ObsidianOptions) {
    this.apiKey = apiKey;
    this.protocol = protocol || "http";
    this.host = host || "localhost";
    this.port = port || 27123;
  }

  private get baseUrl() {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private async fetch<T>(
    path: string,
    {
      method,
      headers,
      body,
    }: {
      method: "GET" | "PATCH" | "POST" | "PUT" | "DELETE";
      headers?: Record<string, string>;
      body?: string;
    },
  ): Promise<T> {
    console.error(`[${method}] ${this.baseUrl}${path}`);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: method,
      headers: { ...this.headers, ...headers },
      body,
    });

    const { ok, statusText, status } = response;
    if (!ok) {
      let parsedError: ErrorResponse | null = null;
      try {
        parsedError = (await response.json()) as ErrorResponse;
      } catch {
        throw new Error(`Error: ${statusText} (${status})`);
      }
      throw new Error(
        `Error: ${parsedError.message} (${parsedError.errorCode})`,
      );
    }

    return (await response.json()) as T;
  }

  status() {
    return this.fetch<StatusResponse>("/", { method: "GET" });
  }

  deleteActive() {
    return this.fetch<void>("/active/", {
      method: "DELETE",
    });
  }

  getActive() {
    return this.fetch<NoteJson>("/active/", {
      method: "GET",
      headers: { Accept: "application/vnd.olrapi.note+json" },
    });
  }

  patchActive({
    operation,
    targetType,
    target,
    content,
    trimTargetWhitespace,
    targetDelimiter,
    contentType,
  }: PatchActiveOptions) {
    return this.fetch<void>("/active/", {
      method: "PATCH",
      headers: {
        Operation: operation,
        "Target-Type": targetType,
        Target: target,
        ...(trimTargetWhitespace && { "Trim-Target-Whitespace": "true" }),
        ...(targetDelimiter && { "Target-Delimiter": targetDelimiter }),
        ...(contentType && { "Content-Type": contentType }),
      },
      body: content,
    });
  }

  postActive({ content }: { content: string }) {
    return this.fetch<void>("/active/", {
      method: "POST",
      headers: { "Content-Type": "text/markdown" },
      body: content,
    });
  }

  putActive({ content }: { content: string }) {
    return this.fetch<void>("/active/", {
      method: "PUT",
      headers: { "Content-Type": "text/markdown" },
      body: content,
    });
  }

  getCommands() {
    return this.fetch<CommandsResponse>("/commands/", { method: "GET" });
  }

  executeCommand({ commandId }: { commandId: string }) {
    return this.fetch<void>(`/commands/${encodeURIComponent(commandId)}/`, {
      method: "POST",
    });
  }

  openFile({
    filename,
    newLeaf,
  }: {
    filename: string;
    newLeaf?: boolean | null;
  }) {
    const qs = newLeaf ? "?newLeaf=true" : "";
    return this.fetch<void>(`/open/${sanitizeAndEncodePath(filename)}${qs}`, {
      method: "POST",
    });
  }

  deletePeriodic({ period }: { period: Period }) {
    return this.fetch<void>(`/periodic/${period}/`, {
      method: "DELETE",
    });
  }

  getPeriodic({ period }: { period: Period }) {
    return this.fetch<NoteJson>(`/periodic/${period}/`, {
      method: "GET",
      headers: { Accept: "application/vnd.olrapi.note+json" },
    });
  }

  patchPeriodic({
    period,
    operation,
    targetType,
    target,
    content,
    trimTargetWhitespace,
    targetDelimiter,
    contentType,
  }: PatchPeriodOptions) {
    return this.fetch<void>(`/periodic/${period}/`, {
      method: "PATCH",
      headers: {
        Operation: operation,
        "Target-Type": targetType,
        Target: target,
        ...(trimTargetWhitespace && { "Trim-Target-Whitespace": "true" }),
        ...(targetDelimiter && { "Target-Delimiter": targetDelimiter }),
        ...(contentType && { "Content-Type": contentType }),
      },
      body: content,
    });
  }

  postPeriodic({ period, content }: { period: Period; content: string }) {
    return this.fetch<void>(`/periodic/${period}/`, {
      method: "POST",
      headers: { "Content-Type": "text/markdown" },
      body: content,
    });
  }

  putPeriodic({ period, content }: { period: Period; content: string }) {
    return this.fetch<void>(`/periodic/${period}/`, {
      method: "PUT",
      headers: { "Content-Type": "text/markdown" },
      body: content,
    });
  }

  searchDataview({ query }: { query: string }) {
    return this.fetch<SearchResult[]>("/search/", {
      method: "POST",
      headers: { "Content-Type": "application/vnd.olrapi.dataview.dql+txt" },
      body: query,
    });
  }

  searchJsonLogic(logic: unknown) {
    return this.fetch<SearchResult[]>("/search/", {
      method: "POST",
      headers: { "Content-Type": "application/vnd.olrapi.jsonlogic+json" },
      body: JSON.stringify(logic),
    });
  }

  simpleSearch({
    query,
    contextLength,
  }: {
    query: string;
    contextLength?: number;
  }) {
    const params = new URLSearchParams({
      query,
      contextLength: contextLength?.toString() || "100",
    });
    return this.fetch<SimpleSearchResponse[]>(`/search/simple/?${params}`, {
      method: "POST",
    });
  }

  listVaultRoot() {
    return this.fetch<ListFilesResponse>("/vault/", { method: "GET" });
  }

  listVaultDirectory({ pathToDirectory }: { pathToDirectory: string }) {
    return this.fetch<ListFilesResponse>(
      `/vault/${sanitizeAndEncodePath(pathToDirectory)}/`,
      { method: "GET" },
    );
  }

  deleteFile({ filename }: { filename: string }) {
    return this.fetch<void>(`/vault/${sanitizeAndEncodePath(filename)}`, {
      method: "DELETE",
    });
  }

  getFile({ filename }: { filename: string }) {
    return this.fetch<NoteJson | string>(
      `/vault/${sanitizeAndEncodePath(filename)}`,
      {
        method: "GET",
        headers: { Accept: "application/vnd.olrapi.note+json" },
      },
    );
  }

  patchFile({
    filename,
    operation,
    targetType,
    target,
    content,
    trimTargetWhitespace,
    targetDelimiter,
    contentType,
  }: PatchFileOptions) {
    return this.fetch<void>(`/vault/${sanitizeAndEncodePath(filename)}`, {
      method: "PATCH",
      headers: {
        Operation: operation,
        "Target-Type": targetType,
        Target: target,
        ...(trimTargetWhitespace && { "Trim-Target-Whitespace": "true" }),
        ...(targetDelimiter && { "Target-Delimiter": targetDelimiter }),
        ...(contentType && { "Content-Type": contentType }),
      },
      body: content,
    });
  }

  postFile({ filename, content }: { filename: string; content: string }) {
    return this.fetch<void>(`/vault/${sanitizeAndEncodePath(filename)}`, {
      method: "POST",
      headers: { "Content-Type": "text/markdown" },
      body: content,
    });
  }

  putFile({ filename, content }: { filename: string; content: string }) {
    return this.fetch<void>(`/vault/${sanitizeAndEncodePath(filename)}`, {
      method: "PUT",
      headers: { "Content-Type": "text/markdown" },
      body: content,
    });
  }
}
