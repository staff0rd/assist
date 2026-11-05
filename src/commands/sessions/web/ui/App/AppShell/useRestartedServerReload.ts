import { useCallback, useEffect, useRef } from "react";
import { fetchServerIdentity } from "./useRestartedServerReload/fetchServerIdentity";
import { useRecheckWhenVisible } from "./useRestartedServerReload/useRecheckWhenVisible";
import { tabRestartPending } from "./useWebserverRestart/tabRestartPending";
import { waitForServerToAnswer } from "./useWebserverRestart/useServerBackReload/waitForServerToAnswer";

export function useRestartedServerReload(reconnecting: boolean): void {
	const baseline = useRef<string | undefined>(undefined);
	const generation = useRef(0);
	const sawDisconnect = useRef(false);

	const check = useCallback(() => {
		const gen = ++generation.current;
		const superseded = () => gen !== generation.current;
		void (async () => {
			if (!(await waitForServerToAnswer(superseded))) return;
			const identity = await fetchServerIdentity();
			if (superseded()) return;
			if (identity === undefined) return check();
			if (baseline.current === undefined) baseline.current = identity;
			else if (identity !== baseline.current && !tabRestartPending.get())
				globalThis.location.reload();
		})();
	}, []);

	const cancel = useCallback(() => {
		generation.current++;
	}, []);

	useEffect(() => {
		void fetchServerIdentity().then((identity) => {
			baseline.current ??= identity;
		});
		return cancel;
	}, [cancel]);

	useEffect(() => {
		if (reconnecting) {
			cancel();
			sawDisconnect.current = true;
			return;
		}
		if (!sawDisconnect.current) return;
		sawDisconnect.current = false;
		check();
	}, [reconnecting, check, cancel]);

	useRecheckWhenVisible(reconnecting, check);
}
