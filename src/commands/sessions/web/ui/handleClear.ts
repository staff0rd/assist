import type { WsDispatch } from "./WsDispatch";

export function handleClear(msg: Record<string, unknown>, d: WsDispatch): void {
	const id = msg.sessionId as string;
	d.buffers.current?.delete(id);
	d.handlers.current?.get(id)?.("\x1bc");
}
