import type { WsDispatch } from "../../../WsDispatch";

type TransferHandoff = { sourceId: string; sessionId: string };

export function handleNotice(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const transfer = msg.transfer as TransferHandoff | undefined;
	if (transfer) d.handoffTransfer(transfer.sourceId, transfer.sessionId);
	d.setSuccess({
		message: msg.message as string,
		sessionId: transfer?.sessionId ?? null,
	});
}
