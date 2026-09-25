import { useCallback, useEffect, useRef } from "react";
import type { SessionInfo } from "../../../../types";
import type { SuccessNotice } from "../../../../useNotices";
import {
	RELOAD_FLAG,
	useReloadNotice,
} from "./useUpdateReload/useReloadNotice";
import { useUpdateCompletion } from "./useUpdateReload/useUpdateCompletion";
import { useWebserverRestart } from "../../useWebserverRestart";

export function useUpdateReload(
	sessions: SessionInfo[],
	reconnecting: boolean,
	setSuccess: (notice: SuccessNotice) => void,
	setError: (message: string) => void,
) {
	const { arm, completed } = useUpdateCompletion(sessions, reconnecting);
	const restartRequested = useRef(false);

	const markReloadedOnNewBundle = useCallback(() => {
		globalThis.sessionStorage?.setItem(RELOAD_FLAG, "1");
	}, []);
	const { error: restartError, restart: restartWebserver } =
		useWebserverRestart("webserver", reconnecting, markReloadedOnNewBundle);

	useReloadNotice(setSuccess);

	useEffect(() => {
		if (restartError) setError(restartError);
	}, [restartError, setError]);

	useEffect(() => {
		if (!completed || restartRequested.current) return;
		restartRequested.current = true;
		void restartWebserver();
	}, [completed, restartWebserver]);

	const armUpdateReload = useCallback(() => {
		restartRequested.current = false;
		arm();
	}, [arm]);

	return { armUpdateReload };
}
