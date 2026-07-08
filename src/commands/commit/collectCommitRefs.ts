import { execSync } from "node:child_process";
import { gitRefUrl } from "../../shared/gitRefUrl";
import type { GitRef } from "../backlog/types";

export function collectCommitRefs(message: string): GitRef[] {
	const refs: GitRef[] = [];
	const branch = git("rev-parse --abbrev-ref HEAD");
	if (branch && branch !== "HEAD") {
		refs.push({
			kind: "branch",
			ref: branch,
			url: gitRefUrl("branch", branch),
		});
	}
	const sha = git("rev-parse HEAD");
	if (sha) {
		const ref: GitRef = {
			kind: "commit",
			ref: sha,
			url: gitRefUrl("commit", sha),
		};
		const subject = message.split("\n", 1)[0];
		if (subject) ref.title = subject;
		refs.push(ref);
	}
	return refs;
}

function git(args: string): string | null {
	try {
		return execSync(`git ${args}`, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch {
		return null;
	}
}
