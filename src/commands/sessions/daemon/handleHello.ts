import {
	ASSIST_VERSION,
	helloCompatible,
	isHello,
	PROTOCOL_VERSION,
} from "./buildHello";
import { daemonLog } from "./daemonLog";
import { windowsVersionCheck } from "./windowsVersionCheck";
import type { WindowsProxyState } from "./WindowsProxyState";

type Msg = Record<string, unknown>;

export function handleHello(state: WindowsProxyState, msg: Msg): void {
	if (!isHello(msg) || helloCompatible(msg)) return;
	const mode = windowsVersionCheck();
	const detail = `protocol ${msg.protocol ?? "legacy"} version ${msg.version} (wsl protocol ${PROTOCOL_VERSION} version ${ASSIST_VERSION})`;
	if (mode === "off") {
		daemonLog(
			`windows daemon protocol mismatch: ${detail}; check disabled (sessions.windowsVersionCheck=off), proceeding`,
		);
		return;
	}
	if (mode === "warn") {
		daemonLog(
			`windows daemon protocol mismatch: ${detail}; proceeding with warning (sessions.windowsVersionCheck=warn)`,
		);
		return;
	}
	daemonLog(`windows daemon protocol mismatch: ${detail}`);
	state.onVersionMismatch(msg.version);
}
