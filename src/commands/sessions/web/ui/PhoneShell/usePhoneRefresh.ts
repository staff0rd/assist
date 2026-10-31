import { useCallback } from "react";
import type { SessionSocket } from "../useSessionSocket";

export function usePhoneRefresh({ wsRef, requestHistory }: SessionSocket) {
	return useCallback(() => {
		wsRef.current?.close();
		requestHistory();
	}, [wsRef, requestHistory]);
}
