import * as fs from "node:fs";
import {
	resolveSyncConflicts,
	type SyncConflict,
} from "./resolveSyncConflicts";

export function createConflictQueue(owns: (target: string) => boolean) {
	const conflicts: SyncConflict[] = [];
	return {
		guard(conflict: SyncConflict, matches: () => boolean): void {
			const { target, run } = conflict;
			if (fs.existsSync(target) && !owns(target) && !matches()) {
				conflicts.push(conflict);
				return;
			}
			run();
		},
		async resolve(yes: boolean): Promise<void> {
			const approved = await resolveSyncConflicts(conflicts.splice(0), yes);
			for (const conflict of approved) conflict.run();
		},
	};
}
