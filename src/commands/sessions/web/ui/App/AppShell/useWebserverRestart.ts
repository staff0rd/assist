import { useCallback, useEffect, useRef, useState } from "react";
import { postRestart, type RestartTarget } from "./postRestart";
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

	const restart = useCallback(async (): Promise<void> => {
		setPending(true);
		arm();
		timeoutRef.current = setTimeout(() => {
			abandon();
			setPending(false);
			setError("Web server did not come back");
		}, RESTART_TIMEOUT_MS);
		try {
			const res = await postRestart(target);
			if (!res.ok) throw new Error("restart failed");
		} catch {
			abandon();
			clearTimeout(timeoutRef.current);
			setPending(false);
			setError("Failed to restart web server");
		}
	}, [target, arm, abandon]);

	return { pending, error, clearError: () => setError(null), restart };
}
