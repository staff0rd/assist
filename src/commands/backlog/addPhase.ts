import chalk from "chalk";
import { commitBacklog } from "./commitBacklog";
import { exportToJsonl } from "./exportToJsonl";
import { openDb } from "./openDb";
import { getBacklogDir, loadAndFindItem } from "./shared";

export function addPhase(
	id: string,
	name: string,
	options: { task?: string[]; manualCheck?: string[] },
): void {
	const result = loadAndFindItem(id);
	if (!result) return;

	const tasks = options.task ?? [];
	if (tasks.length === 0) {
		console.log(chalk.red("At least one --task is required."));
		process.exitCode = 1;
		return;
	}

	const dir = getBacklogDir();
	const db = openDb(dir);
	const itemId = result.item.id;

	const existing = db
		.prepare("SELECT COUNT(*) as cnt FROM plan_phases WHERE item_id = ?")
		.get(itemId) as { cnt: number };
	const phaseIdx = existing.cnt;

	const manualChecks =
		options.manualCheck && options.manualCheck.length > 0
			? JSON.stringify(options.manualCheck)
			: null;

	db.prepare(
		"INSERT INTO plan_phases (item_id, idx, name, manual_checks) VALUES (?, ?, ?, ?)",
	).run(itemId, phaseIdx, name, manualChecks);

	const taskStmt = db.prepare(
		"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
	);
	for (let i = 0; i < tasks.length; i++) {
		taskStmt.run(itemId, phaseIdx, i, tasks[i]);
	}

	exportToJsonl(db, dir);
	commitBacklog(itemId, result.item.name);
	console.log(
		chalk.green(
			`Added phase ${phaseIdx + 1} "${name}" to item #${itemId} with ${tasks.length} task(s).`,
		),
	);
}
