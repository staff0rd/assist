import type { GitRef } from "../backlog/types";
import type { BaseRepoMode } from "./resolveBaseRepo";
import { getCurrentBranch, viewCurrentPr } from "./shared";

type PrView = { number?: number; title?: string; url?: string; state?: string };

export function readSessionPrRef(baseRepo?: BaseRepoMode): GitRef | null {
	try {
		const branch = getCurrentBranch();
		if (!branch || branch === "HEAD") return null;
		const pr = viewCurrentPr<PrView>("number,title,url,state", baseRepo);
		if (typeof pr.number !== "number") return null;
		const ref: GitRef = { kind: "pr", ref: String(pr.number) };
		if (pr.title) ref.title = pr.title;
		if (pr.url) ref.url = pr.url;
		if (pr.state) ref.state = pr.state;
		return ref;
	} catch {
		return null;
	}
}
