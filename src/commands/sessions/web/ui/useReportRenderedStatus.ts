import { useEffect, useRef } from "react";
import type { SessionInfo } from "./types";

export function useReportRenderedStatus(
	sessions: SessionInfo[],
	send: (msg: object) => void,
): void {
	const last = useRef(new Map<string, string>());
	useEffect(() => {
		const live = new Set<string>();
		for (const { id, status } of sessions) {
			live.add(id);
			if (last.current.get(id) === status) continue;
			last.current.set(id, status);
			console.debug(`[sessions] render session ${id} status=${status}`);
			send({ type: "ui-status", sessionId: id, status });
		}
		for (const id of last.current.keys())
			if (!live.has(id)) last.current.delete(id);
	}, [sessions, send]);
}
