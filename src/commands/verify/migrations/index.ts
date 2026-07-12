import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrations as bundledMigrations } from "../../../shared/db/migrations";
import { checkAppendOnly } from "./checkAppendOnly";
import { checkDestructive, DESTRUCTIVE_ACK_MARKER } from "./checkDestructive";
import { checkSequential } from "./checkSequential";
import { listMigrationFiles } from "./listMigrationFiles";
import { readBaselineMigrations } from "./readBaselineMigrations";
import { resolveBaselineRef } from "./resolveBaselineRef";

const REPO_RELATIVE_DIR = "src/shared/db/migrations";

function migrationsDir(): string {
	return path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		"../../../shared/db/migrations",
	);
}

export function migrations(): void {
	const dir = migrationsDir();
	const files = listMigrationFiles(dir);
	const problems: string[] = [];

	problems.push(...checkSequential(bundledMigrations, files));

	for (const finding of checkDestructive(bundledMigrations)) {
		problems.push(
			`Migration ${finding.id} (${finding.name}) contains destructive DDL (${finding.statements.join(", ")}) without a \`-- ${DESTRUCTIVE_ACK_MARKER}\` acknowledgement. Prefer expand/contract; add the marker only once the drop is deliberate and no live build reads the column/table.`,
		);
	}

	const ref = resolveBaselineRef();
	if (ref) {
		const baseline = readBaselineMigrations(REPO_RELATIVE_DIR, ref);
		const current = new Map(
			files.map((file) => [file, readFileSync(path.join(dir, file), "utf8")]),
		);
		for (const finding of checkAppendOnly(baseline, current)) {
			problems.push(
				finding.kind === "removed"
					? `Migration ${finding.file} was removed but ships in ${ref}; migrations are append-only once shipped.`
					: `Migration ${finding.file} was edited but already ships in ${ref}; migrations are append-only. Add a new numbered migration instead.`,
			);
		}
	}

	if (problems.length > 0) {
		console.log("Migration safety violations:\n");
		for (const problem of problems) console.log(`  ${problem}`);
		console.log(`\nTotal: ${problems.length} violation(s).`);
		process.exit(1);
	}

	const suffix = ref ? ` (append-only checked against ${ref})` : "";
	console.log(
		`All ${bundledMigrations.length} migration(s) pass safety checks${suffix}.`,
	);
	process.exit(0);
}
