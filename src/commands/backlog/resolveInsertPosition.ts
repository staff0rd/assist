import chalk from "chalk";
import type { BacklogDb } from "./BacklogDb";

export async function resolveInsertPosition(
	db: BacklogDb,
	itemId: number,
	position: string | undefined,
): Promise<number | undefined> {
	const row = await db.get<{ cnt: number }>(
		"SELECT COUNT(*)::int as cnt FROM plan_phases WHERE item_id = ?",
		[itemId],
	);
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
