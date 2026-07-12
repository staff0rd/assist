import { getMigrationStatus } from "./getMigrationStatus";
import type { MigrationExecutor } from "./MigrationExecutor";

const behindMessage = (applied: number, expected: number): string =>
	`Assist database is behind this build (applied migration ${applied}, build expects ${expected}).
Run \`assist db migrate\` to apply the pending migrations.`;

const aheadMessage = (applied: number, expected: number): string =>
	`Assist database is ahead of this build (applied migration ${applied}, build knows ${expected}).
Update assist (\`assist update\`) to a build that includes the newer migrations.`;

export async function assertMigrationsInSync(
	exec: MigrationExecutor,
): Promise<void> {
	const status = await getMigrationStatus(exec);
	if (status.state === "behind")
		throw new Error(behindMessage(status.applied, status.expected));
	if (status.state === "ahead")
		throw new Error(aheadMessage(status.applied, status.expected));
}
