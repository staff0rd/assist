import { useEffect } from "react";
import type { SuccessNotice } from "./useNotices";

export const RELOAD_FLAG = "assist:reloaded-after-update";

export function useReloadNotice(
	setSuccess: (notice: SuccessNotice) => void,
): void {
	useEffect(() => {
		if (globalThis.sessionStorage?.getItem(RELOAD_FLAG)) {
			globalThis.sessionStorage.removeItem(RELOAD_FLAG);
			setSuccess({
				message: "Reloaded after updating assist",
				sessionId: null,
			});
		}
	}, [setSuccess]);
}
