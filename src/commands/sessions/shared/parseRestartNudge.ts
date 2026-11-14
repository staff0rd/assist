const RESTART_NUDGE =
	/^\s*<assist-restart killed="(\d+)">[\s\S]*<\/assist-restart>\s*$/;

export function parseRestartNudge(text: unknown): number | null {
	if (typeof text !== "string") return null;
	const match = RESTART_NUDGE.exec(text);
	return match ? Number(match[1]) : null;
}
