import { useCallback, useEffect, useRef, useState } from "react";
import { describePeerFailure } from "./useAwaitPeerReturn/describePeerFailure";
import { requestFailure } from "../../requestFailure";
import {
	type DescribeBack,
	usePeerReconnect,
} from "./useAwaitPeerReturn/usePeerReconnect";

const RECONNECT_TIMEOUT_MS = 90_000;

export function useAwaitPeerReturn() {
	const [back, setBack] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const onBack = useCallback((message: string) => {
		clearTimeout(timeoutRef.current);
		setBack(message);
	}, []);
	const { watch, stop } = usePeerReconnect(onBack);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const fail = useCallback(async (peer: string, summary: string) => {
		setError(await describePeerFailure(peer, summary));
	}, []);

	const requestThenAwait = useCallback(
		async (
			peer: string,
			action: string,
			request: () => Promise<Response>,
			describe: DescribeBack,
		): Promise<boolean> => {
			let res: Response | undefined;
			try {
				res = await request();
			} catch {}
			if (!res?.ok) {
				await fail(peer, `${action} failed (${await requestFailure(res)})`);
				return false;
			}
			watch(peer, describe);
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => {
				stop();
				void fail(peer, `${peer} did not come back`);
			}, RECONNECT_TIMEOUT_MS);
			return true;
		},
		[fail, watch, stop],
	);

	return {
		requestThenAwait,
		back,
		clearBack: () => setBack(null),
		error,
		clearError: () => setError(null),
	};
}
