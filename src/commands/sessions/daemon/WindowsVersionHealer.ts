import semver from "semver";
import { autoHealWindowsDaemon } from "./autoHealWindowsDaemon";
import { ASSIST_VERSION } from "./buildHello";
import { daemonLog } from "./daemonLog";
import type { WindowsConnection } from "./WindowsConnection";
import type { WindowsProxyState } from "./WindowsProxyState";

const UNRECOVERABLE_MESSAGE =
	"Windows host is on an incompatible version that auto-update could not resolve; not reconnecting. Update the Windows host manually, then restart.";

function wslStaleMessage(windowsVersion: string): string {
	return `The WSL daemon (${ASSIST_VERSION}) is older than the Windows host (${windowsVersion}); not reconnecting. Update assist in WSL and restart the daemon.`;
}

function windowsIsNewer(windowsVersion: string): boolean {
	return (
		semver.valid(windowsVersion) !== null &&
		semver.valid(ASSIST_VERSION) !== null &&
		semver.gt(windowsVersion, ASSIST_VERSION)
	);
}

const HEALED_MESSAGE =
	"Windows host is up to date — you can reselect the repo now.";

/**
 * Decides how the proxy reacts to a version-handshake mismatch: heal once, then
 * — if the gap persists — latch reconnects off so a host that can't be brought
 * into line (e.g. it can't self-update, or WSL is the older side) doesn't drive
 * an endless reconnect → mismatch → remote-close → re-discover loop. Owns the
 * guard state so a connection close or proxy state reset can't re-arm the loop;
 * only a fresh proxy (a WSL daemon restart) clears it.
 */
export class WindowsVersionHealer {
	private healAttempted = false;
	private healing = false;
	private unrecoverable = false;
	private awaitingConfirmation = false;
	private refusalMessage = UNRECOVERABLE_MESSAGE;

	constructor(
		private readonly conn: WindowsConnection,
		private readonly state: WindowsProxyState,
		private readonly heal: () => Promise<void>,
	) {}

	get blocked(): boolean {
		return this.unrecoverable;
	}

	refusal(): { type: string; message: string } {
		return { type: "error", message: this.refusalMessage };
	}

	async onMismatch(version: string): Promise<void> {
		if (this.healing || this.unrecoverable) return;
		// why: heal already ran and the gap remains, so reconnecting would only mismatch and close again
		if (this.healAttempted) return this.giveUp(version);
		this.healing = true;
		this.healAttempted = true;
		this.awaitingConfirmation = true;
		try {
			await autoHealWindowsDaemon(this.conn, this.state, this.heal, version);
		} finally {
			this.healing = false;
		}
	}

	onCompatible(): void {
		if (!this.awaitingConfirmation) return;
		this.awaitingConfirmation = false;
		daemonLog(
			"windows proxy: post-heal handshake compatible; windows host is in step",
		);
		this.state.broadcast({ type: "notice", message: HEALED_MESSAGE });
	}

	private giveUp(version: string): void {
		this.unrecoverable = true;
		this.awaitingConfirmation = false;
		const wslStale = windowsIsNewer(version);
		if (wslStale) this.refusalMessage = wslStaleMessage(version);
		daemonLog(
			`windows proxy: version mismatch ${version} persists after heal${wslStale ? ` (wsl ${ASSIST_VERSION} is the older side)` : ""}; not reconnecting until the WSL daemon restarts`,
		);
		this.conn.dispose();
		this.state.broadcast(this.refusal());
	}
}
