import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";
import { appendScreenshots } from "./appendScreenshots";
import type { CreateOptions } from "./buildCreateArgs";
import { chainAfterRaise } from "./chainAfterRaise";
import { enableAutoMerge } from "./enableAutoMerge";
import { placePr } from "./placePr";

export async function previewAndPlace(args: {
	sessionId: string;
	title: string;
	body: string;
	prNumber: number | null;
	options: CreateOptions;
}): Promise<void> {
	const decision = await awaitPreviewApproval("PR preview", {
		sessionId: args.sessionId,
		requestId: randomUUID(),
		title: args.title,
		body: args.body,
		prNumber: args.prNumber,
		draft: args.options.draft === true,
	});

	const body = appendScreenshots(args.body, decision.screenshots ?? []);
	const options =
		decision.draft === undefined
			? args.options
			: { ...args.options, draft: decision.draft };

	await placePr(args.prNumber, args.title, body, options);

	if (decision.autoMerge === true) enableAutoMerge();

	await chainAfterRaise(args.prNumber, decision);
}
