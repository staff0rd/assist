import { rmSync, writeFileSync } from "node:fs";
import { getInstallDir } from "../../../../shared/getInstallDir";
import { watchControlPaths } from "../../../watch/watchControlPaths";
import type { AutoUpdateAction } from "../../shared/AutoUpdateAction";
import { autoUpdateControl } from "./autoUpdateControl";
import { autoUpdateState } from "./autoUpdateState";
import { noteAutoUpdate } from "./noteAutoUpdate";

function signalLap(installDir: string, marker: "check" | "stop"): void {
	const control = watchControlPaths(installDir);
	if (control) writeFileSync(control[marker], "");
}

export function applyAutoUpdateAction(
	action: AutoUpdateAction,
): string | undefined {
	const installDir = getInstallDir();
	const loop = autoUpdateState.loop();
	if (action === "resume") {
		if (!autoUpdateControl.paused()) return undefined;
		const control = watchControlPaths(installDir);
		if (control) rmSync(control.stop, { force: true });
		autoUpdateControl.setPaused(false);
		noteAutoUpdate(installDir, "resumed from Updates");
		return undefined;
	}
	if (loop.phase === "off")
		return `auto-update is off (${loop.reason ?? "not running"})`;
	if (action === "pause") {
		if (autoUpdateControl.paused()) return undefined;
		autoUpdateControl.setPaused(true);
		signalLap(installDir, "stop");
		noteAutoUpdate(installDir, "paused from Updates");
		return undefined;
	}
	if (autoUpdateControl.paused())
		return "auto-update is paused; resume it first";
	signalLap(installDir, "check");
	autoUpdateControl.wake();
	noteAutoUpdate(installDir, "check requested from Updates");
	return undefined;
}
