import chalk from "chalk";
import { asc, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { planPhases } from "../../shared/db/schema";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";

export async function resolveInsertPosition(
	orm: Db,
	itemId: number,
	position: string | undefined,
): Promise<number | undefined> {
	const rows = await orm
		.select({ name: planPhases.name })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId))
		.orderBy(asc(planPhases.idx));
	const storedReviewStaysLast = rows.at(-1)?.name === REVIEW_PHASE_NAME;
	const phaseCount = storedReviewStaysLast ? rows.length - 1 : rows.length;

	if (position === undefined) return phaseCount;

	const pos = Number.parseInt(position, 10);
	if (pos < 1 || pos > phaseCount + 1) {
		console.log(
			chalk.red(
				`Position ${pos} is out of range. Must be between 1 and ${phaseCount + 1}.`,
			),
		);
		process.exitCode = 1;
		return undefined;
	}
	return pos - 1;
}
