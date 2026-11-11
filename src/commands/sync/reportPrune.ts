import type { PruneResult } from "./pruneTarget";

export function reportPrune(
	label: string,
	result: PruneResult,
	force: boolean,
): void {
	if (result.orphans.length === 0) {
		console.log(`No orphaned files in ${label}`);
	} else if (force) {
		for (const name of result.removed) {
			console.log(`Removed ${name} from ${label}`);
		}
	} else {
		console.log(`Orphaned files in ${label} (run with --force to remove):`);
		for (const name of result.orphans) {
			console.log(`  ${name}`);
		}
	}

	if (result.skipped.length > 0) {
		console.log(`Left in place in ${label} (not written by sync):`);
		for (const { name, reason } of result.skipped) {
			console.log(`  ${name} - ${reason}`);
		}
	}

	if (result.unmanaged.length === 0) return;

	console.log(`Not managed by sync in ${label} (never removed):`);
	for (const name of result.unmanaged) {
		console.log(`  ${name}`);
	}
}
