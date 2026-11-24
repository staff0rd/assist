import { existsSync } from "node:fs";
import path from "node:path";
import { findRepoRoot } from "../../shared/findRepoRoot";

const SCOPED_TO_COMMAND =
	/^(?:(?:in|during|for|when running|while running|when using)\s+)?`?\/([a-z0-9][\w-]*(?::[\w-]+)*)`?\s*[,:—-]/i;

function candidates(root: string, name: string): string[] {
	const parts = name.split(":");
	return [
		`${path.join(root, ".claude", "commands", ...parts)}.md`,
		path.join(root, ".claude", "skills", name, "SKILL.md"),
		`${path.join(root, "agent", "commands", ...parts)}.md`,
	];
}

export function governedCommandFile(
	text: string,
	cwd: string,
): string | undefined {
	const name = SCOPED_TO_COMMAND.exec(text.trim())?.[1];
	if (!name) return undefined;
	const root = findRepoRoot(cwd) ?? cwd;
	const file = candidates(root, name).find((f) => existsSync(f));
	return file && path.relative(cwd, file);
}
