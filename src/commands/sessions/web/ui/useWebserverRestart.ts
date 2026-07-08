import { useEffect, useRef, useState } from "react";
import { postRestart } from "./postRestart";

const RESTART_TIMEOUT_MS = 15_000;

export function useWebserverRestart(reconnecting: boolean) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const sawDisconnect = useRef(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		if (!pending) return;
		if (reconnecting) {
			sawDisconnect.current = true;
		} else if (sawDisconnect.current) {
			clearTimeout(timeoutRef.current);
			globalThis.location.reload();
		}
	}, [pending, reconnecting]);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	async function restart(): Promise<void> {
		setPending(true);
		sawDisconnect.current = false;
		timeoutRef.current = setTimeout(() => {
			setPending(false);
			setError("Web server did not come back");
		}, RESTART_TIMEOUT_MS);
		try {
			const res = await postRestart("webserver");
			if (!res.ok) throw new Error("restart failed");
		} catch {
			clearTimeout(timeoutRef.current);
			setPending(false);
			setError("Failed to restart web server");
		}
	}

	return { pending, error, clearError: () => setError(null), restart };
}
