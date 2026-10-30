export type ConfigWriteScope = "project" | "global" | "repo" | "user";

export function isConfigWriteScope(value: unknown): value is ConfigWriteScope {
	return (
		value === "project" ||
		value === "global" ||
		value === "repo" ||
		value === "user"
	);
}
