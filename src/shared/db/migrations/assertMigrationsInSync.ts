import { getMigrationStatus } from "./getMigrationStatus";
import type { MigrationExecutor } from "./MigrationExecutor";

const behindMessage = (applied: number, expected: number): string =>
	`Assist database is behind this build (applied migration ${applied}, build expects ${expected}).
Run \`assist db migrate\` to apply the pending migrations.`;

const aheadWarning = (applied: number, expected: number): string =>
	`Assist database is ahead of this build (applied migration ${applied}, build knows ${expected}); continuing because migrations are additive. Update assist (\`assist update\`) to a build that includes the newer migrations.`;

let warnedAhead = false;

export async function assertMigrationsInSync(
	exec: MigrationExecutor,
): Promise<void> {
	const status = await getMigrationStatus(exec);
	if (status.state === "behind")
		throw new Error(behindMessage(status.applied, status.expected));
	if (status.state === "ahead" && !warnedAhead) {
		warnedAhead = true;
		console.warn(aheadWarning(status.applied, status.expected));
	}
}
