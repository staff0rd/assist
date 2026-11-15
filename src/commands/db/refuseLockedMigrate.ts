import { currentExecutionIdentity } from "../../shared/currentExecutionIdentity";
import { isSchemaLocked } from "../schema/isSchemaLocked";

export async function refuseLockedMigrate(): Promise<void> {
	const identity = currentExecutionIdentity();
	if (!identity || !(await isSchemaLocked(identity))) return;
	console.error(
		"Error: refusing to run `assist db migrate` — it applies migrations to the shared database, and schema is locked for this session.",
	);
	console.error(
		"Confirm the schema change with the user first, then run `assist schema unlock` and wait for them to confirm the PIN. To verify a migration, use `createTestDb` in a test instead. Nothing was applied.",
	);
	process.exit(1);
}
