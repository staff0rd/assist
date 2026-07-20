import { join } from "node:path";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";

export function getMigrationPinPath(pin: string): string {
	return join(getRestrictedDir(), `db-migration-pin-${pin}.json`);
}

export function getMigrationApprovalPath(migrationId: number): string {
	return join(getRestrictedDir(), `db-migration-approval-${migrationId}.json`);
}
