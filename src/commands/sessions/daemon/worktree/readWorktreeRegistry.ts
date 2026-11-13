import type { HarnessKind } from "../../../../shared/harnesses";
import { loadJson, saveJson } from "../../../../shared/loadJson";

const REGISTRY_FILE = "worktrees.json";

type WorktreeRecord = {
	path: string;
	clone: string;
	origin: string;
	harness?: HarnessKind;
	leftover?: string;
};

type Registry = Record<
	string,
	{
		clone: string;
		origin: string;
		reaped?: boolean;
		harness?: HarnessKind;
		leftover?: string;
	}
>;

export function readWorktreeRegistry(): WorktreeRecord[] {
	const data = loadJson<Registry>(REGISTRY_FILE);
	return Object.entries(data)
		.filter(([, record]) => !record.reaped)
		.map(([path, { reaped: _reaped, ...record }]) => ({ path, ...record }));
}

export function readReapedWorktreeRegistry(): WorktreeRecord[] {
	const data = loadJson<Registry>(REGISTRY_FILE);
	return Object.entries(data)
		.filter(([, record]) => record.reaped)
		.map(([path, { reaped: _reaped, ...record }]) => ({ path, ...record }));
}

export function worktreeAttributionIncludingReaped(
	path: string,
): { clone: string; origin: string } | undefined {
	const record = loadJson<Registry>(REGISTRY_FILE)[path];
	return record ? { clone: record.clone, origin: record.origin } : undefined;
}

export function recordWorktree(
	path: string,
	clone: string,
	origin: string,
): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	data[path] = { clone, origin };
	saveJson(REGISTRY_FILE, data);
}

export function recordWorktreeHarness(
	path: string,
	harness: HarnessKind,
): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	const record = data[path];
	if (!record || record.reaped || record.harness === harness) return;
	data[path] = { ...record, harness };
	saveJson(REGISTRY_FILE, data);
}

export function forgetWorktree(path: string): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	const record = data[path];
	if (!record || record.reaped) return;
	data[path] = { ...record, reaped: true };
	saveJson(REGISTRY_FILE, data);
}

/** Marks a path assist failed to delete as reaped, so each restart's
 * recheckReapedWorktrees retries it; `deferredReason` is set only while the
 * removal waits on Docker, which is what nodes doctor lists. */
export function markLeftover(
	path: string,
	deferredReason: string | undefined,
): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	const record = data[path];
	if (!record) return;
	const { leftover: _leftover, ...rest } = record;
	data[path] = {
		...rest,
		reaped: true,
		...(deferredReason ? { leftover: deferredReason } : {}),
	};
	saveJson(REGISTRY_FILE, data);
}

export function clearLeftover(path: string): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	const record = data[path];
	if (!record?.leftover) return;
	const { leftover: _leftover, ...rest } = record;
	data[path] = rest;
	saveJson(REGISTRY_FILE, data);
}
