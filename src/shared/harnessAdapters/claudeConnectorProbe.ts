import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { CapabilityStatus } from "./types";
import { supported, unsupported } from "./unsupported";

type ClaudeState = { claudeAiMcpEverConnected?: unknown };

function knownConnectedConnectors(): string[] | undefined {
	const dir = process.env.CLAUDE_CONFIG_DIR ?? homedir();
	try {
		const state = JSON.parse(
			readFileSync(join(dir, ".claude.json"), "utf8"),
		) as ClaudeState;
		const list = state.claudeAiMcpEverConnected;
		return Array.isArray(list)
			? list.filter((name): name is string => typeof name === "string")
			: undefined;
	} catch {
		return undefined;
	}
}

export function claudeConnectorProbe(
	connector: "Gmail" | "Slack",
): CapabilityStatus {
	const connected = knownConnectedConnectors();
	if (!connected || connected.includes(`claude.ai ${connector}`))
		return supported;
	return unsupported(
		`the claude.ai ${connector} connector has never connected in Claude`,
		`connect ${connector} at https://claude.ai/settings/connectors, then start claude once so it connects`,
	);
}
