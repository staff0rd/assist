import type { ConversationTarget } from "../../../shared/sessionConversationTarget";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import { withNode } from "../withNode";

export type FileContentState =
	| { status: "loading" }
	| { status: "absent" }
	| { status: "too-large" }
	| { status: "error" }
	| { status: "ready"; content: string; mtimeMs: number };

export type FileRevision = {
	commit: string;
	conversation?: ConversationTarget;
};

function fileQuery(cwd: string, path: string, revision?: FileRevision): string {
	const params = new URLSearchParams({ cwd, path });
	if (revision) {
		params.set("commit", revision.commit);
		const { conversation } = revision;
		if (conversation) params.set("session", conversation.conversationId);
		if (conversation?.harness) params.set("harness", conversation.harness);
	}
	return params.toString();
}

export async function fetchFileContent(
	cwd: string,
	path: string,
	node?: string,
	revision?: FileRevision,
): Promise<FileContentState> {
	try {
		const res = await apiFetch(
			withNode(`/api/file?${fileQuery(cwd, path, revision)}`, node),
		);
		if (res.status === 404) return { status: "absent" };
		if (res.status === 413) return { status: "too-large" };
		if (!res.ok) return { status: "error" };
		const body = await res.json();
		if (typeof body.content !== "string") return { status: "error" };
		return {
			status: "ready",
			content: body.content,
			mtimeMs: typeof body.mtimeMs === "number" ? body.mtimeMs : 0,
		};
	} catch (error) {
		reportCaughtError(error, "file content");
		return { status: "error" };
	}
}
