import { getInstallDir, isGitRepo } from "../../shared/getInstallDir";
import { migrations } from "../../shared/db/migrations";
import { readAppliedIds } from "../../shared/db/migrations/getMigrationStatus";
import type { MigrationExecutor } from "../../shared/db/migrations/MigrationExecutor";
import { listReleasedMigrationIds } from "./listReleasedMigrationIds";

function refuse(lines: string[]): never {
	for (const line of lines) console.error(line);
	process.exit(1);
}

export async function refuseUnreleasedMigrations(
	exec: MigrationExecutor,
): Promise<void> {
	const repo = getInstallDir();
	if (!isGitRepo(repo)) return;
	const applied = new Set(await readAppliedIds(exec));
	const pending = migrations.filter((m) => !applied.has(m.id));
	if (pending.length === 0) return;
	const released = listReleasedMigrationIds(repo);
	if (!released)
		refuse([
			`Error: refusing to apply migrations — cannot read origin/main in ${repo} to confirm they are released. Nothing was applied.`,
		]);
	const unreleased = pending.filter((m) => !released.has(m.id));
	if (unreleased.length === 0) return;
	refuse([
		`Error: refusing to apply migrations not on origin/main: ${unreleased.map((m) => `${m.id} (${m.name})`).join(", ")}.`,
		"The database is shared by every released build, so only released migrations may be applied. Verify an unreleased migration with `createTestDb` in a test instead. Nothing was applied.",
	]);
}
