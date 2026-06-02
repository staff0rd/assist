import type { PlanPhase } from "./types";
import type { ListMutationFlags } from "./update/applyListMutations";
import {
	type ResolvedList,
	resolveListUpdate,
} from "./update/resolveListUpdate";

export type UpdatePhaseOptions = {
	name?: string;
	task?: string[];
	manualCheck?: string[];
	addTask?: string[];
	editTask?: string[];
	removeTask?: string;
	addCheck?: string[];
	editCheck?: string[];
	removeCheck?: string;
};

type PhaseFields = { name?: string; task?: string[]; manualCheck?: string[] };

type ResolveResult =
	| { ok: true; fields: PhaseFields }
	| { ok: false; error: string };

const TASK_FLAGS: ListMutationFlags = {
	add: "--add-task",
	edit: "--edit-task",
	remove: "--remove-task",
};

const CHECK_FLAGS: ListMutationFlags = {
	add: "--add-check",
	edit: "--edit-check",
	remove: "--remove-check",
};

function resolveTasks(o: UpdatePhaseOptions, current: PlanPhase | undefined) {
	return resolveListUpdate(
		o.task,
		(current?.tasks ?? []).map((t) => t.task),
		{ add: o.addTask, edit: o.editTask, remove: o.removeTask },
		"--task",
		TASK_FLAGS,
	);
}

function resolveChecks(o: UpdatePhaseOptions, current: PlanPhase | undefined) {
	return resolveListUpdate(
		o.manualCheck,
		current?.manualChecks ?? [],
		{ add: o.addCheck, edit: o.editCheck, remove: o.removeCheck },
		"--manual-check",
		CHECK_FLAGS,
	);
}

function buildFields(
	name: string | undefined,
	tasks: ResolvedList,
	checks: ResolvedList,
): ResolveResult {
	const fields: PhaseFields = {
		name,
		task: tasks.items,
		manualCheck: checks.items,
	};
	if (!fields.name && !fields.task && !fields.manualCheck) {
		return {
			ok: false,
			error: "Nothing to update. Provide at least one flag.",
		};
	}
	return { ok: true, fields };
}

export function resolvePhaseFields(
	options: UpdatePhaseOptions,
	current: PlanPhase | undefined,
): ResolveResult {
	const tasks = resolveTasks(options, current);
	if (!tasks.ok) return tasks;

	const checks = resolveChecks(options, current);
	if (!checks.ok) return checks;

	return buildFields(options.name, tasks, checks);
}
