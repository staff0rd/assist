import type { SessionInfo } from "../types";

type TransferStatus = {
	label: string;
	title: string;
	pending: boolean;
	queued: boolean;
	failed: boolean;
};

const idle = { pending: false, queued: false, failed: false };

export function transferStatus(session: SessionInfo): TransferStatus {
	const transfer = session.transfer;
	if (!transfer)
		return { ...idle, label: "Transfer", title: "Transfer to node" };
	if (transfer.queued)
		return {
			...idle,
			label: `Transfer to ${transfer.target} pending`,
			title: `Transfers to ${transfer.target} once the agent is idle`,
			queued: true,
		};
	if (transfer.error)
		return {
			...idle,
			label: "Retry transfer",
			title: `Transfer to ${transfer.target} failed: ${transfer.error}`,
			failed: true,
		};
	return {
		...idle,
		label: `Transferring to ${transfer.target}…`,
		title: `Transferring to ${transfer.target}`,
		pending: true,
	};
}
