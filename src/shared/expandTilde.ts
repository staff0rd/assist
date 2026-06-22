import { homedir } from "node:os";

export function expandTilde(value: string): string {
	return value.startsWith("~/") ? homedir() + value.slice(1) : value;
}
