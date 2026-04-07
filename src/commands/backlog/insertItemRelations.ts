import type { BacklogDb } from "./openDb";
import type { BacklogItem } from "./types";

function insertComments(db: BacklogDb, item: BacklogItem): void {
	if (!item.comments) return;
	const stmtWithId = db.prepare(
		"INSERT INTO comments (id, item_id, idx, text, phase, timestamp, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
	);
	const stmtNoId = db.prepare(
		"INSERT INTO comments (item_id, idx, text, phase, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)",
	);
	for (let i = 0; i < item.comments.length; i++) {
		const c = item.comments[i];
		if (c.id !== undefined) {
			stmtWithId.run(
				c.id,
				item.id,
				i,
				c.text,
				c.phase ?? null,
				c.timestamp,
				c.type,
			);
		} else {
			stmtNoId.run(item.id, i, c.text, c.phase ?? null, c.timestamp, c.type);
		}
	}
}

function insertLinks(db: BacklogDb, item: BacklogItem): void {
	if (!item.links) return;
	const stmt = db.prepare(
		"INSERT INTO links (item_id, type, target_id) VALUES (?, ?, ?)",
	);
	for (const l of item.links) {
		stmt.run(item.id, l.type, l.targetId);
	}
}

function insertPlan(db: BacklogDb, item: BacklogItem): void {
	if (!item.plan) return;
	const phaseStmt = db.prepare(
		"INSERT INTO plan_phases (item_id, idx, name, manual_checks) VALUES (?, ?, ?, ?)",
	);
	const taskStmt = db.prepare(
		"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
	);
	for (let pi = 0; pi < item.plan.length; pi++) {
		const phase = item.plan[pi];
		phaseStmt.run(
			item.id,
			pi,
			phase.name,
			phase.manualChecks ? JSON.stringify(phase.manualChecks) : null,
		);
		for (let ti = 0; ti < phase.tasks.length; ti++) {
			const task = phase.tasks[ti];
			taskStmt.run(item.id, pi, ti, task.task);
		}
	}
}

export function insertItemRelations(db: BacklogDb, item: BacklogItem): void {
	insertComments(db, item);
	insertLinks(db, item);
	insertPlan(db, item);
}
