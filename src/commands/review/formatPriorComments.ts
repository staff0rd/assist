import type { ExistingComment } from "./fetchExistingComments";

type Thread = {
	root: ExistingComment;
	replies: ExistingComment[];
};

function threadKey(
	c: ExistingComment,
	byId: Map<number, ExistingComment>,
): string {
	if (c.threadId) return c.threadId;
	if (c.inReplyToId !== null && byId.has(c.inReplyToId)) {
		return `root-${c.inReplyToId}`;
	}
	return `root-${c.id}`;
}

function groupIntoThreads(comments: ExistingComment[]): Thread[] {
	const byId = new Map(comments.map((c) => [c.id, c] as const));
	const threads = new Map<string, Thread>();
	for (const c of comments) {
		const key = threadKey(c, byId);
		const existing = threads.get(key);
		const parent = c.inReplyToId !== null ? byId.get(c.inReplyToId) : undefined;
		if (existing) {
			if (parent) existing.replies.push(c);
		} else if (parent) {
			threads.set(key, { root: parent, replies: [c] });
		} else {
			threads.set(key, { root: c, replies: [] });
		}
	}
	return [...threads.values()];
}

function headerFor(c: ExistingComment): string {
	const location = c.line !== null ? `${c.file}:${c.line}` : c.file;
	const tags = [c.resolved && "resolved", c.outdated && "outdated"]
		.filter(Boolean)
		.join(", ");
	return tags ? `### ${location} [${tags}]` : `### ${location}`;
}

function formatThread(thread: Thread): string {
	const lines = [
		headerFor(thread.root),
		`**${thread.root.author}**: ${thread.root.body.trim()}`,
		...thread.replies.map((r) => `**${r.author}** (reply): ${r.body.trim()}`),
	];
	return lines.join("\n\n");
}

const INTRO = `The PR already has the review comments below (including resolved and outdated threads). Avoid re-raising findings that a prior comment substantively covers.`;

export function formatPriorComments(comments: ExistingComment[]): string {
	if (comments.length === 0) return "";
	const blocks = groupIntoThreads(comments).map(formatThread);
	return `## Prior review comments\n\n${INTRO}\n\n${blocks.join("\n\n")}`;
}
