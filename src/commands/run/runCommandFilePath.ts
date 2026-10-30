import { join } from "node:path";

export function runCommandFilePath(name: string): string {
	const segments = name.split(":");
	const file = `${segments.pop()}.md`;
	return join(".claude", "commands", ...segments, file);
}
