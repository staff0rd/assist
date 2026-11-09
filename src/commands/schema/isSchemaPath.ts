import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { getProjectRoot } from "../../shared/loadConfig";

export const SCHEMA_LOCK_REASON =
	"Database schema files (src/shared/db/migrations/migrationNNNN*.ts, src/shared/db/migrations.ts, src/shared/db/schema.ts and any src/shared/db/*.ts that defines a pgTable) are locked: a schema change needs the user's sign-off (see src/shared/db/CLAUDE.md). Confirm the schema change with the user first, then run `assist schema unlock` to request a PIN and wait for the user to confirm it with `assist schema confirm <pin>` before retrying. In a backlog item session the unlock lasts for the current phase on this harness; otherwise it lasts for this conversation only.";

const FIXED_SCHEMA_PATH =
	/^src\/shared\/db\/(?:migrations\/migration\d{4}[^/]*\.ts|migrations\.ts|schema\.ts)$/;
const DB_MODULE = /^src\/shared\/db\/[^/]+\.ts$/;

function readOrEmpty(path: string): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		return "";
	}
}

export function isSchemaRelativePath(
	rel: string,
	root: string,
	incomingContents: string[] = [],
): boolean {
	const normalized = rel.replace(/\\/g, "/");
	if (FIXED_SCHEMA_PATH.test(normalized)) return true;
	if (!DB_MODULE.test(normalized)) return false;
	return [...incomingContents, readOrEmpty(resolve(root, normalized))].some(
		(text) => text.includes("pgTable"),
	);
}

export function isSchemaPath(
	filePath: string,
	incomingContents: string[] = [],
	root: string = getProjectRoot(),
): boolean {
	return isSchemaRelativePath(
		relative(root, resolve(root, filePath)),
		root,
		incomingContents,
	);
}
