import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage, phaseUsageMessages } from "./schema";

export type ResponseUsage = {
	messageId: string;
	inputTokens: number;
	outputTokens: number;
};

export async function recordPhaseTranscriptUsage(
	db: Db,
	itemId: number,
	phaseIdx: number,
	responses: ResponseUsage[],
): Promise<{ tokensUp: number; tokensDown: number }> {
	const byId = new Map<string, ResponseUsage>();
	for (const r of responses) byId.set(r.messageId, r);
	const unique = [...byId.values()];
	if (unique.length === 0) return { tokensUp: 0, tokensDown: 0 };

	return db.transaction(async (tx) => {
		const inserted = await tx
			.insert(phaseUsageMessages)
			.values(unique.map((r) => ({ itemId, phaseIdx, messageId: r.messageId })))
			.onConflictDoNothing()
			.returning({ messageId: phaseUsageMessages.messageId });

		let tokensUp = 0;
		let tokensDown = 0;
		for (const { messageId } of inserted) {
			const r = byId.get(messageId);
			if (!r) continue;
			tokensUp += r.outputTokens;
			tokensDown += r.inputTokens;
		}
		if (tokensUp <= 0 && tokensDown <= 0) return { tokensUp: 0, tokensDown: 0 };

		await tx
			.insert(phaseUsage)
			.values({ itemId, phaseIdx, tokensUp, tokensDown })
			.onConflictDoUpdate({
				target: [phaseUsage.itemId, phaseUsage.phaseIdx],
				set: {
					tokensUp: sql`${phaseUsage.tokensUp} + ${tokensUp}`,
					tokensDown: sql`${phaseUsage.tokensDown} + ${tokensDown}`,
				},
			});
		return { tokensUp, tokensDown };
	});
}
