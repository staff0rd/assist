import { claudeConnectorTools } from "./claudeConnectorTools";
import type { ConnectorRun } from "./types";

export function buildClaudeConnectorArgs({
	prompt,
	schema,
	tools,
}: Pick<ConnectorRun, "prompt" | "schema" | "tools">): string[] {
	return [
		"-p",
		"--tools",
		"",
		"--permission-mode",
		"dontAsk",
		"--allowedTools",
		...tools.map(claudeConnectorTools.native),
		"--disallowedTools",
		...claudeConnectorTools.denied,
		"--no-session-persistence",
		"--output-format",
		"stream-json",
		"--verbose",
		"--json-schema",
		JSON.stringify(schema),
		"--",
		prompt,
	];
}
