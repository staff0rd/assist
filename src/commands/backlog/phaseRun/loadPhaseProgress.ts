import { eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";
import { items, planPhases } from "../../../shared/db/schema";
import type { PhaseProgress } from "./PhaseProgress";

type PhaseRunRow = {
	idx: number;
	runState: string | null;
	runToken: string | null;
};

function progressFromRows(
	currentPhase: number | null | undefined,
	rows: PhaseRunRow[],
): PhaseProgress {
	const withState = (state: string) =>
		rows.filter((row) => row.runState === state).map((row) => row.idx);
	return {
		currentPhase: currentPhase ?? undefined,
		running: withState("running"),
		done: withState("done"),
		failed: withState("failed"),
	};
}

export async function loadPhaseRunRows(
	db: BacklogDatabase,
	itemId: number,
): Promise<PhaseRunRow[]> {
	return db
		.select({
			idx: planPhases.idx,
			runState: planPhases.runState,
			runToken: planPhases.runToken,
		})
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId));
}

export async function loadPhaseProgress(
	db: BacklogDatabase,
	itemId: number,
): Promise<PhaseProgress> {
	const [item] = await db
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, itemId));
	return progressFromRows(
		item?.currentPhase,
		await loadPhaseRunRows(db, itemId),
	);
}
