import path from "node:path";

export type AdviceScopeKind = "user-db" | "user-node" | "repo-db";

type RuleScopeLocation =
	| { kind: "advice"; scope: AdviceScopeKind; name: string }
	| { kind: "claude-md"; file: string; name: string };

const ADVICE_SCOPES: Record<AdviceScopeKind, string> = {
	"user-db": "User (db)",
	"user-node": "User (node)",
	"repo-db": "Repo (db)",
};

const CLAUDE_MD_PREFIX = "claude-md:";

export function ruleScopeLocation(
	scopeId: string,
	root: string,
): RuleScopeLocation | undefined {
	if (scopeId in ADVICE_SCOPES) {
		const scope = scopeId as AdviceScopeKind;
		return { kind: "advice", scope, name: ADVICE_SCOPES[scope] };
	}
	if (!scopeId.startsWith(CLAUDE_MD_PREFIX)) return undefined;
	const dir = scopeId.slice(CLAUDE_MD_PREFIX.length);
	const file = path.resolve(root, dir, "CLAUDE.md");
	const relative = path.relative(root, file);
	if (relative.startsWith("..") || path.isAbsolute(relative)) return undefined;
	return { kind: "claude-md", file, name: `${dir}CLAUDE.md` };
}
