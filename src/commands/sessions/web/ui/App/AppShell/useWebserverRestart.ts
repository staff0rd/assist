import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { reportCaughtError } from "../../clientFailures/reportCaughtError";
import { postRestart, type RestartTarget } from "./postRestart";
import { tabRestartPending } from "./useWebserverRestart/tabRestartPending";
import { useServerBackReload } from "./useWebserverRestart/useServerBackReload";

const RESTART_TIMEOUT_MS = 15_000;

export function useWebserverRestart(
	target: RestartTarget,
	reconnecting: boolean,
	onBeforeReload?: () => void,
) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const { arm, abandon } = useServerBackReload(pending, reconnecting, () => {
		clearTimeout(timeoutRef.current);
		onBeforeReload?.();
		globalThis.location.reload();
	});

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const restartTo = useCallback(
		async (to: RestartTarget): Promise<void> => {
			setPending(true);
			tabRestartPending.set(true);
			arm();
			timeoutRef.current = setTimeout(() => {
				tabRestartPending.set(false);
				abandon();
				setPending(false);
				setError("Web server did not come back");
			}, RESTART_TIMEOUT_MS);
			try {
				const res = await postRestart(to);
				if (!res.ok) throw new Error("restart failed");
			} catch (error) {
				reportCaughtError(error, "web server restart");
				tabRestartPending.set(false);
				abandon();
				clearTimeout(timeoutRef.current);
				setPending(false);
				setError("Failed to restart web server");
			}
		},
		[arm, abandon],
	);

	const restart = useCallback(() => restartTo(target), [restartTo, target]);
	const clearError = useCallback(() => setError(null), []);

	return useMemo(
		() => ({ pending, error, clearError, restart, restartTo }),
		[pending, error, clearError, restart, restartTo],
	);
}

export type WebserverRestart = ReturnType<typeof useWebserverRestart>;
