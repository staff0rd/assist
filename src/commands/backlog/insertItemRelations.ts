import type { BacklogDb } from "./BacklogDb";
import type { BacklogItem } from "./types";

async function insertComments(db: BacklogDb, item: BacklogItem): Promise<void> {
	if (!item.comments) return;
	for (let i = 0; i < item.comments.length; i++) {
		const c = item.comments[i];
		if (c.id !== undefined) {
			await db.run(
				"INSERT INTO comments (id, item_id, idx, text, phase, timestamp, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
				[c.id, item.id, i, c.text, c.phase ?? null, c.timestamp, c.type],
			);
		} else {
			await db.run(
				"INSERT INTO comments (item_id, idx, text, phase, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)",
				[item.id, i, c.text, c.phase ?? null, c.timestamp, c.type],
			);
		}
	}
}

async function insertLinks(db: BacklogDb, item: BacklogItem): Promise<void> {
	if (!item.links) return;
	for (const l of item.links) {
		await db.run(
			"INSERT INTO links (item_id, type, target_id) VALUES (?, ?, ?)",
			[item.id, l.type, l.targetId],
		);
	}
}

async function insertPlan(db: BacklogDb, item: BacklogItem): Promise<void> {
	if (!item.plan) return;
	for (let pi = 0; pi < item.plan.length; pi++) {
		const phase = item.plan[pi];
		await db.run(
			"INSERT INTO plan_phases (item_id, idx, name, manual_checks) VALUES (?, ?, ?, ?)",
			[
				item.id,
				pi,
				phase.name,
				phase.manualChecks ? JSON.stringify(phase.manualChecks) : null,
			],
		);
		for (let ti = 0; ti < phase.tasks.length; ti++) {
			const task = phase.tasks[ti];
			await db.run(
				"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
				[item.id, pi, ti, task.task],
			);
		}
	}
}

export async function insertItemRelations(
	db: BacklogDb,
	item: BacklogItem,
): Promise<void> {
	await insertComments(db, item);
	await insertLinks(db, item);
	await insertPlan(db, item);
}
