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
		const comments = decision.comments ?? [];
		if (comments.length > 0) {
			console.error(
				`\nThe reviewer left ${comments.length} comment${comments.length === 1 ? "" : "s"} on the preview. Address each one, then re-run this command:\n`,
			);
			for (const [i, c] of comments.entries()) {
				const quoted = c.quote
					.split("\n")
					.map((line) => `  > ${line}`)
					.join("\n");
				console.error(`${i + 1}. On:\n${quoted}\n   Comment: ${c.note}\n`);
			}
		}
		process.exit(1);
	}

	await placePr(args.prNumber, args.title, args.body, args.options);
}
