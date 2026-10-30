import { useEffect } from "react";
import type { Connection } from "./toConnection";

export function useAutoRetry(
	connection: Connection,
	homeUrl: string | undefined,
	probe: (url: string, attempt: number) => void,
) {
	useEffect(() => {
		if (connection.kind !== "unreachable" || !homeUrl) return;
		const { attempt, retryAt } = connection;
		const timer = setTimeout(
			() => probe(homeUrl, attempt + 1),
			Math.max(0, retryAt - Date.now()),
		);
		return () => clearTimeout(timer);
	}, [connection, homeUrl, probe]);
}
