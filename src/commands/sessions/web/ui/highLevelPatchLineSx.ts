const ADDED = "rgba(76, 175, 80, 0.16)";
const REMOVED = "rgba(244, 67, 54, 0.16)";
const HUNK = "rgba(33, 150, 243, 0.14)";

const base = {
	display: "block",
	fontFamily: "monospace",
	fontSize: 11,
	lineHeight: 1.5,
	whiteSpace: "pre-wrap",
	wordBreak: "break-all",
	px: 1,
} as const;

export function highLevelPatchLineSx(line: string) {
	if (line.startsWith("@@"))
		return { ...base, bgcolor: HUNK, color: "info.main" };
	if (line.startsWith("+"))
		return { ...base, bgcolor: ADDED, color: "success.main" };
	if (line.startsWith("-"))
		return { ...base, bgcolor: REMOVED, color: "error.main" };
	return { ...base, color: "text.secondary" };
}
