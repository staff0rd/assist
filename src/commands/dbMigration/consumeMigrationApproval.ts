import { existsSync, unlinkSync } from "node:fs";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { getMigrationApprovalPath } from "./getMigrationPinPath";

export function consumeMigrationApproval(migrationId: number): boolean {
	sweepRestrictedDir();
	const path = getMigrationApprovalPath(migrationId);
	if (!existsSync(path)) return false;
	try {
		unlinkSync(path);
		return true;
	} catch {
		return false;
	}
}
