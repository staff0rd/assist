import chalk from "chalk";
import type { AppliedMigration } from "../../shared/db/migrations/applyMigrations";
import type { MigrationStatus } from "../../shared/db/migrations/getMigrationStatus";

export function reportApplied(applied: AppliedMigration[]): void {
	if (applied.length === 0) {
		console.error(chalk.green("Database is up to date; nothing to apply."));
		return;
	}
	for (const migration of applied) {
		console.error(
			chalk.green(`Applied migration ${migration.id} (${migration.name}).`),
		);
	}
}

export function reportMigrationStatus(status: MigrationStatus): void {
	if (status.state === "in-sync") {
		console.error(
			chalk.green(`In sync at migration ${status.version} (latest).`),
		);
		return;
	}
	if (status.state === "behind") {
		console.error(
			chalk.yellow(
				`Behind: applied ${status.applied}, build expects ${status.expected}.`,
			),
		);
		console.error(
			chalk.yellow(
				`Pending: ${status.pending.join(", ")}. Run \`assist db migrate\`.`,
			),
		);
		return;
	}
	console.error(
		chalk.red(
			`Ahead: applied ${status.applied}, build knows ${status.expected}. Update assist.`,
		),
	);
}
