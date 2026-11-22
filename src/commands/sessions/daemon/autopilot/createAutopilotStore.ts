import { daemonPaths } from "../daemonPaths";
import type {
	AutopilotRecord,
	AutopilotRepoRecord,
	AutopilotTick,
} from "./AutopilotRecord";
import { loadAutopilotRecord } from "./loadAutopilotRecord";
import { saveAutopilotRecord } from "./saveAutopilotRecord";

const MAX_TICKS = 100;

export type AutopilotStore = ReturnType<typeof createAutopilotStore>;

export function createAutopilotStore(path: string = daemonPaths.autopilot) {
	let record: AutopilotRecord = {};
	const repo = (cwd: string): AutopilotRepoRecord =>
		record[cwd] ?? { paused: false, ticks: [] };
	const update = (
		cwd: string,
		mutate: (repo: AutopilotRepoRecord) => void,
	): void => {
		const next = structuredClone(repo(cwd));
		mutate(next);
		next.ticks = next.ticks.slice(-MAX_TICKS);
		record = { ...record, [cwd]: next };
		saveAutopilotRecord(path, record);
	};
	return {
		load(): void {
			record = loadAutopilotRecord(path);
		},
		repo,
		cwds: (): string[] => Object.keys(record),
		update,
		addTick(
			cwd: string,
			tick: Omit<AutopilotTick, "at">,
			mutate?: (repo: AutopilotRepoRecord) => void,
		): void {
			update(cwd, (next) => {
				next.ticks.push({ at: new Date().toISOString(), ...tick });
				if (tick.outcome !== "finished") next.followUp = undefined;
				mutate?.(next);
			});
		},
	};
}
