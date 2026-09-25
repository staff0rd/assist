import type { WsDispatch } from "../../../WsDispatch";

export function handleError(msg: Record<string, unknown>, d: WsDispatch): void {
	const message = msg.message as string;
	d.setError(message);
	d.failPendingLaunch(message);
}
