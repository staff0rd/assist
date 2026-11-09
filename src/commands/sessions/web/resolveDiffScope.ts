import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { branchDiffBase } from "./branchDiffBase";
import { itemScopeCommits } from "./itemScopeCommits";

export type DiffScope =
	| { kind: "all" }
	| { kind: "uncommitted" }
	| { kind: "branch"; base: string }
	| { kind: "commit"; sha: string };

export async function resolveDiffScope(
	cwd: string,
	session: ConversationTarget | undefined,
	scope: string | undefined,
): Promise<DiffScope | undefined> {
	if (!scope || scope === "all") return { kind: "all" };
	if (scope === "uncommitted") return { kind: "uncommitted" };
	if (scope === "branch") {
		const base = await branchDiffBase(cwd);
		return base ? { kind: "branch", base } : undefined;
	}
	const commits = await itemScopeCommits(cwd, session);
	if (!commits.some((commit) => commit.sha === scope)) return undefined;
	return { kind: "commit", sha: scope };
}
