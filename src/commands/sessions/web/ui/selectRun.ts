import type { RunConfigInfo } from "./types";

type CreateRunFn = (name: string, args: string[], cwd?: string) => void;

/**
 * When a no-param run config is selected, execute it immediately and return null.
 * Otherwise return the name so it can be stored as the selected run.
 */
export function selectRun(
	name: string | null,
	configs: RunConfigInfo[],
	cwd: string,
	onCreateRun: CreateRunFn,
): string | null {
	if (name) {
		const config = configs.find((c) => c.name === name);
		if (!config?.params?.length) {
			onCreateRun(name, [], cwd);
			return null;
		}
	}
	return name;
}
