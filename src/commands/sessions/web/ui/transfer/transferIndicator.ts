import type { SessionInfo } from "../types";

export type TransferTone = "pending" | "queued" | "failed";

type TransferIndicator = { tone: TransferTone; label: string };

export const transferToneColor: Record<TransferTone, string> = {
	pending: "primary.main",
	queued: "warning.main",
	failed: "error.main",
};

export function transferIndicator(
	session: SessionInfo,
): TransferIndicator | undefined {
	const transfer = session.transfer;
	if (!transfer) return undefined;
	if (transfer.queued)
		return { tone: "queued", label: `Transfer to ${transfer.target} queued` };
	if (transfer.error) return { tone: "failed", label: "Transfer failed" };
	return { tone: "pending", label: `Transferring → ${transfer.target}` };
}
