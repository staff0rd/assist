import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";

export type SyncConflict = {
	target: string;
	action: "overwrite" | "delete";
	run: () => void;
};

export async function resolveSyncConflicts(
	conflicts: SyncConflict[],
	yes: boolean,
): Promise<SyncConflict[]> {
	if (conflicts.length === 0) return [];

	console.log(
		chalk.yellow(
			`\n⚠️  ${conflicts.length} file(s) exist that assist sync did not write:`,
		),
	);
	for (const { action, target } of conflicts) {
		console.log(`  ${action} ${target}`);
	}

	const confirmed =
		!yes &&
		(await promptConfirm(
			chalk.red("Replace them with assist's versions?"),
			false,
		));
	if (confirmed) return conflicts;

	console.log(
		"Left them in place. Move them aside and re-run assist sync to install assist's versions.",
	);
	return [];
}
