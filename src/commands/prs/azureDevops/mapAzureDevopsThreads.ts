import type { LineComment } from "../types";

type Position = { line?: number };

export type AzureDevopsThread = {
	id: number;
	status?: string;
	isDeleted?: boolean;
	threadContext?: {
		filePath?: string;
		rightFileStart?: Position;
		leftFileStart?: Position;
	} | null;
	comments?: {
		id: number;
		author?: { displayName?: string; uniqueName?: string };
		content?: string;
		commentType?: string;
		isDeleted?: boolean;
	}[];
};

const OPEN_STATUSES = new Set(["active", "pending", "unknown"]);

function isResolved(status: string | undefined): boolean {
	return status !== undefined && !OPEN_STATUSES.has(status);
}

function threadLine(thread: AzureDevopsThread): number | null {
	const context = thread.threadContext;
	return context?.rightFileStart?.line ?? context?.leftFileStart?.line ?? null;
}

function threadPath(thread: AzureDevopsThread): string {
	return thread.threadContext?.filePath?.replace(/^[/]/, "") ?? "";
}

export function mapAzureDevopsThreads(
	threads: AzureDevopsThread[],
	prUrl: string,
): LineComment[] {
	return threads
		.filter((thread) => !thread.isDeleted)
		.flatMap((thread) =>
			(thread.comments ?? [])
				.filter((c) => !c.isDeleted && c.commentType !== "system" && c.content)
				.map((c): LineComment => ({
					type: "line",
					id: thread.id,
					threadId: String(thread.id),
					user: c.author?.displayName ?? c.author?.uniqueName ?? "unknown",
					path: threadPath(thread),
					line: threadLine(thread),
					body: c.content ?? "",
					diff_hunk: "",
					html_url: `${prUrl}?discussionId=${thread.id}`,
					resolved: isResolved(thread.status),
				})),
		);
}
