import type { WsDispatch } from "./WsDispatch";

export function handleOutput(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const id = msg.sessionId as string;
	const prev = d.buffers.current?.get(id) ?? "";
	d.buffers.current?.set(id, prev + (msg.data as string));
	d.handlers.current?.get(id)?.(msg.data as string);
	d.markInitialized(id);
}
