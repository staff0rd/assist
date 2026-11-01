import type { SessionInfo } from "../types";

type TransferStatus = {
	label: string;
	title: string;
	pending: boolean;
	failed: boolean;
};

export function transferStatus(session: SessionInfo): TransferStatus {
	const transfer = session.transfer;
	if (!transfer)
		return {
			label: "Transfer",
			title: "Transfer to node",
			pending: false,
			failed: false,
		};
	if (transfer.error)
		return {
			label: "Retry transfer",
			title: `Transfer to ${transfer.target} failed: ${transfer.error}`,
			pending: false,
			failed: true,
		};
	return {
		label: `Transferring to ${transfer.target}…`,
		title: `Transferring to ${transfer.target}`,
		pending: true,
		failed: false,
	};
}
