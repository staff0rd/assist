type DenyRule = { pattern: string; message: string };

/**
 * Merge global and project deny rules by pattern key.
 * Project rules override global rules with the same pattern.
 * Rules from both sources are concatenated, with global rules first.
 */
export function mergeDenyRules(
	globalDeny: DenyRule[] | undefined,
	projectDeny: DenyRule[] | undefined,
): DenyRule[] | undefined {
	if (!globalDeny && !projectDeny) return undefined;
	if (!globalDeny) return projectDeny;
	if (!projectDeny) return globalDeny;

	const projectPatterns = new Set(projectDeny.map((r) => r.pattern));
	const globalOnly = globalDeny.filter((r) => !projectPatterns.has(r.pattern));
	return [...globalOnly, ...projectDeny];
}

function runKey(r: Record<string, unknown>): string | undefined {
	return typeof r.name === "string" ? r.name : undefined;
}

export function mergeRunConfigs(
	globalRun: Record<string, unknown>[] | undefined,
	projectRun: Record<string, unknown>[] | undefined,
): Record<string, unknown>[] | undefined {
	if (!globalRun && !projectRun) return undefined;
	if (!globalRun) return projectRun;
	if (!projectRun) return globalRun;

	const projectNames = new Set(
		projectRun.map(runKey).filter((n): n is string => n !== undefined),
	);
	const globalOnly = globalRun.filter((r) => {
		const key = runKey(r);
		return key === undefined || !projectNames.has(key);
	});
	return [...globalOnly, ...projectRun];
}

/**
 * Merge two raw config objects, applying deny-specific merge logic
 * instead of shallow overwrite.
 */
export function mergeRawConfigs(
	globalRaw: Record<string, unknown>,
	projectRaw: Record<string, unknown>,
): Record<string, unknown> {
	const deny = mergeDenyRules(
		globalRaw.deny as DenyRule[] | undefined,
		projectRaw.deny as DenyRule[] | undefined,
	);
	const run = mergeRunConfigs(
		globalRaw.run as Record<string, unknown>[] | undefined,
		projectRaw.run as Record<string, unknown>[] | undefined,
	);
	const merged = { ...globalRaw, ...projectRaw };
	if (deny !== undefined) {
		merged.deny = deny;
	}
	if (run !== undefined) {
		merged.run = run;
	}
	const globalSubtasks = globalRaw.subtasks as unknown[] | undefined;
	const projectSubtasks = projectRaw.subtasks as unknown[] | undefined;
	if (globalSubtasks || projectSubtasks) {
		merged.subtasks = [...(globalSubtasks ?? []), ...(projectSubtasks ?? [])];
	}
	return merged;
}
