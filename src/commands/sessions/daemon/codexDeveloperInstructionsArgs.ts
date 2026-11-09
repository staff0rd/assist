import * as fs from "node:fs";

export function codexDeveloperInstructionsArgs(
	file: string | undefined,
): string[] {
	if (!file) return [];
	/* why: codex parses a -c value as TOML; a JSON string literal is a valid TOML
	 * basic string, so the multi-line prompt arrives verbatim. */
	const text = JSON.stringify(fs.readFileSync(file, "utf8"));
	return ["-c", `developer_instructions=${text}`];
}
