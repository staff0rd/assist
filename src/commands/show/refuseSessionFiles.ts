import { homedir } from "node:os";
import { resolveSessionTranscript } from "../sessions/shared/resolveSessionTranscript";
import { findShownSessionFiles } from "./findShownSessionFiles";
import { sessionWrittenPaths } from "./sessionWrittenPaths";

export function refuseSessionFiles(body: string): void {
	const claudeSessionId = process.env.CLAUDE_CODE_SESSION_ID;
	if (!claudeSessionId) return;
	const transcript = resolveSessionTranscript(claudeSessionId);
	if (!transcript) return;
	const shown = findShownSessionFiles(
		body,
		sessionWrittenPaths(transcript.path),
		{ home: homedir(), cwd: process.cwd() },
	);
	if (shown.length === 0) return;
	console.error(
		[
			"Error: refusing to show files this session created or edited; the user already sees them in the session's diff:",
			...shown.map((path) => `  ${path}`),
			"Remove them (and any label or folder entry that exists only for them) and re-run, or skip the show if nothing is left.",
		].join("\n"),
	);
	process.exit(1);
}
