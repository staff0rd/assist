import { execSync } from "node:child_process";

type Scope =
	| { mode: "working-copy" }
	| { mode: "full" }
	| { mode: "base"; ref: string }
	| { mode: "commit"; ref: string };

const SCOPE_ALL = "all";
const SCOPE_BASE = "base:";
const SCOPE_COMMIT = "commit:";

export const scopeHelpText = `${SCOPE_ALL} | ${SCOPE_BASE}<ref> | ${SCOPE_COMMIT}<ref>`;

export function parseScope(raw: string | undefined): Scope {
	if (!raw) return { mode: "working-copy" };
	if (raw === SCOPE_ALL) return { mode: "full" };
	if (raw.startsWith(SCOPE_BASE))
		return { mode: "base", ref: raw.slice(SCOPE_BASE.length) };
	if (raw.startsWith(SCOPE_COMMIT))
		return { mode: "commit", ref: raw.slice(SCOPE_COMMIT.length) };
	throw new Error(`Invalid --scope value: ${raw}. Expected ${scopeHelpText}`);
}

export function getChangedCsFiles(scope: Scope): string[] | null {
	if (scope.mode === "full") return null;

	let cmd: string;
	if (scope.mode === "base") {
		cmd = `git diff --name-only ${scope.ref}...HEAD`;
	} else if (scope.mode === "commit") {
		cmd = `git diff --name-only ${scope.ref}~1 ${scope.ref}`;
	} else {
		cmd = "git diff --name-only HEAD";
	}
	const output = execSync(cmd, { encoding: "utf8" }).trim();
	if (output === "") return [];
	return output.split("\n").filter((f) => f.toLowerCase().endsWith(".cs"));
}
