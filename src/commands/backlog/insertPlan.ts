import type { BacklogDatabase } from "../../shared/db/Db";
import { planPhases, planTasks } from "../../shared/db/schema";
import type { BacklogItem } from "./types";

export async function insertPlan(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	if (!item.plan?.length) return;
	await db.insert(planPhases).values(
		item.plan.map((phase, pi) => ({
			itemId: item.id,
			idx: pi,
			name: phase.name,
			manualChecks: phase.manualChecks
				? JSON.stringify(phase.manualChecks)
				: null,
		})),
	);
	const tasks = item.plan.flatMap((phase, pi) =>
		phase.tasks.map((task, ti) => ({
			itemId: item.id,
			phaseIdx: pi,
			idx: ti,
			task: task.task,
		})),
	);
	if (tasks.length) await db.insert(planTasks).values(tasks);
}
