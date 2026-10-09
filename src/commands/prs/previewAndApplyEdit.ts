import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";
import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { appendScreenshots } from "./appendScreenshots";
import { applyEdit } from "./applyEdit";

export async function previewAndApplyEdit(args: {
	sessionId: string;
	number: number;
	title: string | undefined;
	currentTitle: string;
	body: string;
	screenshots: PreviewAttachment[];
}): Promise<void> {
	const decision = await awaitPreviewApproval("PR preview", {
		sessionId: args.sessionId,
		requestId: randomUUID(),
		title: args.title ?? args.currentTitle,
		body: args.body,
		prNumber: args.number,
	});

	const attachments = [...args.screenshots, ...(decision.screenshots ?? [])];
	applyEdit(
		args.number,
		args.title,
		appendScreenshots(args.body, attachments),
		attachments,
	);
}
