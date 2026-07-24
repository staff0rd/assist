import type { PrDecision } from "./parseIncoming";

export function reportPrRejection(decision: PrDecision): never {
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
