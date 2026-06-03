import chalk from "chalk";
import { count, eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { planPhases } from "./backlogSchema";

export async function resolveInsertPosition(
	orm: BacklogOrm,
	itemId: number,
	position: string | undefined,
): Promise<number | undefined> {
	const [row] = await orm
		.select({ cnt: count() })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId));
	const phaseCount = row?.cnt ?? 0;

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
