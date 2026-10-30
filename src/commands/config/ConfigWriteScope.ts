export type ConfigWriteScope = "project" | "global" | "repo" | "user";

export const CONFIG_SCOPES_BY_PRECEDENCE: ConfigWriteScope[] = [
	"project",
	"repo",
	"global",
	"user",
];

export function isConfigWriteScope(value: unknown): value is ConfigWriteScope {
	return (
		value === "project" ||
		value === "global" ||
		value === "repo" ||
		value === "user"
	);
}
