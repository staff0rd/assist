import { latestMigrationId } from "../../shared/db/migrations";

export function nextMigrationId(): number {
	return latestMigrationId + 1;
}
