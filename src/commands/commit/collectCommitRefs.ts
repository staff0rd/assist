import { gitRefUrl } from "../../shared/gitRefUrl";
import type { GitRef } from "../backlog/types";
import { tryGit } from "../../shared/tryGit";

export function collectCommitRefs(message: string): GitRef[] {
	const refs: GitRef[] = [];
	const branch = tryGit("rev-parse", "--abbrev-ref", "HEAD");
	if (branch && branch !== "HEAD") {
		refs.push({
			kind: "branch",
			ref: branch,
			url: gitRefUrl("branch", branch),
		});
	}
	const sha = tryGit("rev-parse", "HEAD");
	if (sha) {
		const ref: GitRef = {
			kind: "commit",
			ref: sha,
			url: gitRefUrl("commit", sha),
		};
		const subject = message.split("\n", 1)[0];
		if (subject) ref.title = subject;
		refs.push(ref);
		const parent = tryGit("rev-parse", "HEAD^");
		if (parent) refs.push({ kind: "commit-parent", ref: parent });
	}
	return refs;
}
