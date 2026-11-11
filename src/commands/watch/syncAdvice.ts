const rules = [
	{
		matches: (path: string) => path.startsWith("agent/commands/"),
		reason: "agent/commands changed",
	},
	{
		matches: (path: string) => path.startsWith("agent/skills/"),
		reason: "agent/skills changed",
	},
	{
		matches: (path: string) => path === "claude/settings.json",
		reason: "claude/settings.json changed",
	},
	{
		matches: (path: string) => path === "agent/design-system-prompt.md",
		reason: "agent/design-system-prompt.md changed",
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
