import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import { linkHealRefusal } from "./linkHealRefusal";
import { broadcastToViewers } from "./LinkRelayState";
import { runLinkHeal } from "./runLinkHeal";
import { blockLink } from "./teardownLink";

export class LinkHealer {
	private healAttempted = false;
	private healing = false;
	private awaitingConfirmation = false;

	constructor(private readonly ctx: LinkContext) {}

	async onMismatch(peerVersion: string): Promise<void> {
		if (this.healing) return;
		const node = this.ctx.spec.name;
		const refusal = linkHealRefusal(node, peerVersion, this.healAttempted);
		if (refusal) {
			this.awaitingConfirmation = false;
			daemonLog(`link ${node} heal: latched, not reconnecting: ${refusal}`);
			return blockLink(this.ctx, refusal);
		}
		this.healing = true;
		this.healAttempted = true;
		this.awaitingConfirmation = true;
		try {
			await runLinkHeal(this.ctx, peerVersion);
		} finally {
			this.healing = false;
		}
	}

	onCompatible(): void {
		if (!this.awaitingConfirmation) return;
		this.awaitingConfirmation = false;
		const node = this.ctx.spec.name;
		daemonLog(`link ${node} heal: post-heal handshake compatible`);
		broadcastToViewers(this.ctx.relay, {
			type: "notice",
			message: `${node} is up to date.`,
		});
	}
}
