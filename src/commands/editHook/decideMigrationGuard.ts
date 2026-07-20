import { consumeMigrationApproval } from "../dbMigration/consumeMigrationApproval";
import { type EditHookInput } from "./decideOverrideGuard";

const MIGRATION_PATH =
	/(?:^|\/)src\/shared\/db\/migrations\/migration(\d{4})[^/]*\.ts$/;

function denyReason(migrationId: number): string {
	return (
		`This Write creates a new database migration (migration ${migrationId}), which is ` +
		"blocked by the migration gate. Schema changes must be approved by a human. Confirm " +
		"the change with the user first, then run `assist db-migration unlock` to page a human " +
		"for a pin, and `assist db-migration confirm <pin>` to approve this migration. The " +
		"approved write is then allowed once."
	);
}

function newMigrationId(
	input: EditHookInput,
	existingContent: string | undefined,
): number | undefined {
	if (input.tool_name !== "Write") return undefined;
	if (existingContent !== undefined) return undefined;
	const filePath = input.tool_input.file_path;
	if (!filePath) return undefined;
	const match = filePath.replace(/\\/g, "/").match(MIGRATION_PATH);
	if (!match) return undefined;
	return Number.parseInt(match[1], 10);
}

export function decideMigrationGuard(
	input: EditHookInput,
	existingContent?: string,
): string | undefined {
	const migrationId = newMigrationId(input, existingContent);
	if (migrationId === undefined) return undefined;
	if (consumeMigrationApproval(migrationId)) return undefined;
	return denyReason(migrationId);
}
