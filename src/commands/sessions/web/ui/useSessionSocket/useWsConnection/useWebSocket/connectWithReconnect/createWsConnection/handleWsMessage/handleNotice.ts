import type { WsDispatch } from "../../../WsDispatch";

export function handleNotice(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	d.setSuccess({ message: msg.message as string, sessionId: null });
}
