import { execSync } from "node:child_process";
import { fetchThreadIds } from "../prs/fetchThreadIds";
import { findCurrentPrNumber, getRepoInfo } from "../prs/shared";

export type ExistingComment = {
	id: number;
	threadId: string;
	file: string;
	line: number | null;
	author: string;
	body: string;
	inReplyToId: number | null;
	resolved: boolean;
	outdated: boolean;
};

type RawComment = {
	id: number;
	user: { login: string };
	path: string;
	line: number | null;
	original_line: number | null;
	position: number | null;
	body: string;
	in_reply_to_id?: number;
};

function fetchRawComments(
	org: string,
	repo: string,
	prNumber: number,
): RawComment[] {
	const out = execSync(
		`gh api --paginate repos/${org}/${repo}/pulls/${prNumber}/comments`,
		{ encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 },
	);
	if (!out.trim()) return [];
	return JSON.parse(out);
}

export function fetchExistingComments(): ExistingComment[] | null {
	const prNumber = findCurrentPrNumber();
	if (prNumber === null) return null;
	const { org, repo } = getRepoInfo();
	const raw = fetchRawComments(org, repo, prNumber);
	if (raw.length === 0) return [];
	const threadInfo = fetchThreadIds(org, repo, prNumber);
	return raw.map((c) => {
		const threadId = threadInfo.threadMap.get(c.id) ?? "";
		return {
			id: c.id,
			threadId,
			file: c.path,
			line: c.line ?? c.original_line ?? null,
			author: c.user.login,
			body: c.body,
			inReplyToId: c.in_reply_to_id ?? null,
			resolved: threadId !== "" && threadInfo.resolvedThreadIds.has(threadId),
			outdated: c.position === null,
		};
	});
}
