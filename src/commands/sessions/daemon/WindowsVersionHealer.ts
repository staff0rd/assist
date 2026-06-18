import { autoHealWindowsDaemon } from "./autoHealWindowsDaemon";
import { daemonLog } from "./daemonLog";
import type { WindowsConnection } from "./WindowsConnection";
import type { WindowsProxyState } from "./WindowsProxyState";

const UNRECOVERABLE_MESSAGE =
	"Windows host is on an incompatible version that auto-update could not resolve; not reconnecting. Update the Windows host manually, then restart.";

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

	constructor(
		private readonly conn: WindowsConnection,
		private readonly state: WindowsProxyState,
		private readonly heal: () => Promise<void>,
	) {}

	get blocked(): boolean {
		return this.unrecoverable;
	}

	refusal(): { type: string; message: string } {
		return { type: "error", message: UNRECOVERABLE_MESSAGE };
	}

	async onMismatch(version: string): Promise<void> {
		if (this.healing || this.unrecoverable) return;
		// why: heal already ran and the gap remains, so reconnecting would only mismatch and close again
		if (this.healAttempted) return this.giveUp(version);
		this.healing = true;
		this.healAttempted = true;
		try {
			await autoHealWindowsDaemon(this.conn, this.state, this.heal, version);
		} finally {
			this.healing = false;
		}
	}

	private giveUp(version: string): void {
		this.unrecoverable = true;
		daemonLog(
			`windows proxy: version mismatch ${version} persists after heal; not reconnecting until the WSL daemon restarts`,
		);
		this.conn.dispose();
		this.state.broadcast(this.refusal());
	}
}
