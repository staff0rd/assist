import { execFileSync } from "node:child_process";

export function migrateAfterUpdate(): void {
	try {
		// Runs the freshly installed entry script so it knows the new build's migrations.
		execFileSync(
			process.execPath,
			[process.argv[1], "db", "migrate", "--after-update"],
			{ stdio: "inherit" },
		);
	} catch (error) {
		console.error(
			`Failed to apply migrations: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		console.error("Run `assist db migrate` to apply them.");
	}
}
