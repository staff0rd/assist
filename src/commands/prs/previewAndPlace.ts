import { randomUUID } from "node:crypto";
import type { CreateOptions } from "./buildCreateArgs";
import { placePr } from "./placePr";
import { requestPrDecision } from "./requestPrDecision";

export async function previewAndPlace(args: {
	sessionId: string;
	title: string;
	body: string;
	prNumber: number | null;
	options: CreateOptions;
}): Promise<void> {
	console.log("Awaiting your approval in the assist web UI preview pane…");

	let decision: Awaited<ReturnType<typeof requestPrDecision>>;
	try {
		decision = await requestPrDecision({
			sessionId: args.sessionId,
			requestId: randomUUID(),
			title: args.title,
			body: args.body,
			prNumber: args.prNumber,
		});
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}

	if (decision.decision === "reject") {
		console.error(
			`PR preview rejected${decision.reason ? `: ${decision.reason}` : "."}`,
		);
		process.exit(1);
	}

	await placePr(args.prNumber, args.title, args.body, args.options);
}
