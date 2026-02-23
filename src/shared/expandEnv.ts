import { homedir } from "node:os";

function expandTilde(value: string): string {
	return value.startsWith("~/") ? homedir() + value.slice(1) : value;
}

export function expandEnv(env: Record<string, string>): Record<string, string> {
	return Object.fromEntries(
		Object.entries(env).map(([k, v]) => [k, expandTilde(v)]),
	);
}
