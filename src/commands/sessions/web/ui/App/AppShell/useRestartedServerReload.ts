import { useEffect, useRef } from "react";
import { fetchServerIdentity } from "./useRestartedServerReload/fetchServerIdentity";
import { tabRestartPending } from "./useWebserverRestart/tabRestartPending";
import { useServerBackReload } from "./useWebserverRestart/useServerBackReload";

export function useRestartedServerReload(reconnecting: boolean): void {
	const baseline = useRef<string | undefined>(undefined);
	const armRef = useRef<() => void>(() => {});

	const { arm } = useServerBackReload(true, reconnecting, () => {
		void fetchServerIdentity().then((identity) => {
			const changed =
				identity !== undefined &&
				baseline.current !== undefined &&
				identity !== baseline.current;
			if (changed && !tabRestartPending.get()) {
				globalThis.location.reload();
				return;
			}
			if (identity !== undefined) baseline.current = identity;
			armRef.current();
		});
	});
	armRef.current = arm;

	useEffect(() => {
		void fetchServerIdentity().then((identity) => {
			baseline.current ??= identity;
		});
		arm();
	}, [arm]);
}
