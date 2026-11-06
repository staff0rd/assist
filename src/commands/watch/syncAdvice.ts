const rules = [
	{
		matches: (path: string) => path.startsWith("claude/commands/"),
		reason: "claude/commands changed",
	},
	{
		matches: (path: string) => path.startsWith("claude/skills/"),
		reason: "claude/skills changed",
	},
	{
		matches: (path: string) => path === "claude/settings.json",
		reason: "claude/settings.json changed",
	},
	{
		matches: (path: string) => path === "claude/design-system-prompt.md",
		reason: "claude/design-system-prompt.md changed",
	},
	{
		matches: (path: string) => path.startsWith("codex/"),
		reason: "codex sources changed",
	},
	{
		matches: (path: string) => path.startsWith("pi/"),
		reason: "pi sources changed",
	},
];

export function syncAdvice(paths: string[]): string[] {
	return rules
		.filter((rule) => paths.some(rule.matches))
		.map((rule) => rule.reason);
}
