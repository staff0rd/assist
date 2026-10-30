import { useCallback, useEffect, useRef, useState } from "react";
import { setApiBase } from "../apiUrl";
import { type NodeHealth, probeHealth } from "./probeHealth";
import { type Connection, toConnection } from "./toConnection";
import { useAutoRetry } from "./useAutoRetry";

export function useHomeConnection(homeUrl: string | undefined) {
	const [connection, setConnection] = useState<Connection>({ kind: "probing" });
	const probeSeq = useRef(0);
	const probedUrl = useRef<string | undefined>(undefined);

	const probe = useCallback(
		async (url: string, attempt: number, showProbing: boolean) => {
			const seq = ++probeSeq.current;
			setApiBase(url);
			if (showProbing) setConnection({ kind: "probing" });
			const result = await probeHealth(url);
			if (seq === probeSeq.current)
				setConnection(toConnection(result, attempt));
		},
		[],
	);

	useEffect(() => {
		if (!homeUrl || homeUrl === probedUrl.current) return;
		probedUrl.current = homeUrl;
		void probe(homeUrl, 0, true);
	}, [homeUrl, probe]);

	const retryQuietly = useCallback(
		(url: string, attempt: number) => void probe(url, attempt, false),
		[probe],
	);
	useAutoRetry(connection, homeUrl, retryQuietly);

	const retry = useCallback(() => {
		if (homeUrl) void probe(homeUrl, 0, true);
	}, [homeUrl, probe]);

	const recheck = useCallback(() => {
		if (homeUrl) void probe(homeUrl, 0, false);
	}, [homeUrl, probe]);

	const markConnected = useCallback((url: string, health: NodeHealth) => {
		probeSeq.current++;
		probedUrl.current = url;
		setApiBase(url);
		setConnection({ kind: "connected", health });
	}, []);

	return { connection, retry, recheck, markConnected };
}
