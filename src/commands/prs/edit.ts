import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";
import { appendScreenshots } from "./appendScreenshots";
import { applyEdit } from "./applyEdit";
import { editPrBody } from "./editPrBody";
import { getCurrentPr } from "./shared";
import { validatePrContent } from "./validatePrContent";

type EditOptions = {
	title?: string;
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
};

export async function edit(options: EditOptions): Promise<void> {
	const hasResolves = (options.resolves?.length ?? 0) > 0;
	const hasSection =
		options.what !== undefined ||
		options.why !== undefined ||
		options.how !== undefined ||
		hasResolves;

	if (!options.title && !hasSection) {
		console.error(
			"Usage: assist prs edit [--title <title>] [--what <what>] [--why <why>] [--how <how>] [--resolves <key>]",
		);
		process.exit(1);
	}

	const { number, title, body } = getCurrentPr();
	const newBody = editPrBody(body, options);
	validatePrContent(options.title ?? "", newBody);

	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION === "1" && sessionId) {
		const decision = await awaitPreviewApproval("PR preview", {
			sessionId,
			requestId: randomUUID(),
			title: options.title ?? title,
			body: newBody,
			prNumber: number,
		});

		const attachments = decision.screenshots ?? [];
		applyEdit(
			number,
			options.title,
			appendScreenshots(newBody, attachments),
			attachments,
		);
		return;
	}

	applyEdit(number, options.title, newBody);
}
