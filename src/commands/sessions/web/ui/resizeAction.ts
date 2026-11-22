import type { ResizeMode } from "./ResizeFn";
import { viewerId } from "./viewerId";

type SendFn = (msg: object) => void;

export function resizeAction(send: SendFn) {
	return (sessionId: string, cols: number, rows: number, mode?: ResizeMode) =>
		send({
			type: "resize",
			sessionId,
			cols,
			rows,
			viewerId,
			claim: mode === "claim",
			refresh: mode === "refresh",
		});
}
