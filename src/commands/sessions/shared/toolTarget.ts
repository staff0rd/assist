/** Pick a short, human-readable target for a tool_use from its input. */
export function toolTarget(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const i = input as Record<string, unknown>;
	const str = (v: unknown) => (typeof v === "string" ? v : "");
	const target =
		str(i.file_path) ||
		str(i.path) ||
		str(i.notebook_path) ||
		str(i.command) ||
		str(i.pattern) ||
		str(i.url) ||
		str(i.query) ||
		str(i.description) ||
		str(i.prompt);
	return target.replace(/\s+/g, " ").trim().slice(0, 120);
}
