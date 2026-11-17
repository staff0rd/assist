import { claudeConnectorTools } from "./claudeConnectorTools";
import type { ConnectorTool } from "./types";

export type ClaudeInit = { tools: unknown; mcpServers: unknown };

function stringList(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

function describeServers(value: unknown): string {
	if (!Array.isArray(value) || value.length === 0) return "none";
	return value
		.map((server: { name?: unknown; status?: unknown }) =>
			server?.status ? `${server.name} (${server.status})` : `${server?.name}`,
		)
		.join(", ");
}

function connectorName(native: string): string {
	return native.match(/^mcp__claude_ai_([^_]+)__/)?.[1] ?? native;
}

export function missingConnectorToolsError(
	requested: ConnectorTool[],
	init: ClaudeInit,
): Error | undefined {
	const available = new Set(stringList(init.tools));
	const missing = requested
		.map(claudeConnectorTools.native)
		.filter((native) => !available.has(native));
	if (missing.length === 0) return undefined;
	const connectors = [...new Set(missing.map(connectorName))];
	return new Error(
		`claude.ai ${connectors.join(" and ")} connector${connectors.length > 1 ? "s" : ""} unavailable to the claude run: missing ${missing.map(claudeConnectorTools.label).join(", ")}. MCP servers at start: ${describeServers(init.mcpServers)}`,
	);
}
