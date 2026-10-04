import { useCallback, useEffect, useRef, useState } from "react";
import { postRestart } from "../../postRestart";
import { describePeerFailure } from "./usePeerRestart/describePeerFailure";
import { requestFailure } from "./usePeerRestart/requestFailure";
import { usePeerReconnect } from "./usePeerRestart/usePeerReconnect";

const RECONNECT_TIMEOUT_MS = 90_000;

export function usePeerRestart() {
	const [back, setBack] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const onBack = useCallback((message: string) => {
		clearTimeout(timeoutRef.current);
		setBack(message);
	}, []);
	const { watch, stop } = usePeerReconnect(onBack);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const restart = async (peer: string): Promise<boolean> => {
		let res: Response | undefined;
		try {
			res = await postRestart("both", peer);
		} catch {}
		if (!res?.ok) {
			const summary = `Restart ${peer} failed (${await requestFailure(res)})`;
			setError(await describePeerFailure(peer, summary));
			return false;
		}
		watch(peer);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			stop();
			void describePeerFailure(peer, `${peer} did not come back`).then(
				setError,
			);
		}, RECONNECT_TIMEOUT_MS);
		return true;
	};

	return {
		restart,
		back,
		clearBack: () => setBack(null),
		error,
		clearError: () => setError(null),
	};
}
