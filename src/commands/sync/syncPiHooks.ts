import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";

export const PI_PERMISSION_GATE_FILE = "assist-permission-gate.ts";

export function piPermissionGateTarget(): string {
	return path.join(harnesses.pi.homeDir, "extensions", PI_PERMISSION_GATE_FILE);
}

export function syncPiHooks(sourcePath: string): void {
	const target = piPermissionGateTarget();
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.copyFileSync(sourcePath, target);
	console.log(
		"Registered assist permission-gate extension in ~/.pi/agent/extensions",
	);
}
