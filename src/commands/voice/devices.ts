import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { getPythonDir, getVenvPython } from "./shared";

export function devices(): void {
	const script = join(getPythonDir(), "list_devices.py");
	spawnSync(getVenvPython(), [script], { stdio: "inherit" });
}
