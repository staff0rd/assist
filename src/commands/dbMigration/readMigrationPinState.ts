import { existsSync, readFileSync } from "node:fs";
import { getMigrationPinPath } from "./getMigrationPinPath";

type MigrationPinState = { pin: string; migrationId: number };

export function readMigrationPinState(
	pin: string,
): MigrationPinState | undefined {
	const path = getMigrationPinPath(pin);
	if (!existsSync(path)) return undefined;
	try {
		const state: MigrationPinState = JSON.parse(readFileSync(path, "utf8"));
		if (state.pin !== pin) return undefined;
		if (!Number.isInteger(state.migrationId)) return undefined;
		return state;
	} catch {
		return undefined;
	}
}
