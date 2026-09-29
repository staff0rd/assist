import path from "node:path";

export function applyCommand(scopeRoot: string): string {
	const root = path.relative(process.cwd(), scopeRoot) || ".";
	return `assist refactor restructure ${root} --apply`;
}
