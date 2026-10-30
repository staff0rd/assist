import { useEffect, useState } from "react";
import { type ProbeResult, probeHealth } from "./probeHealth";

const PROBE_INTERVAL_MS = 15_000;

export function useNodeProbes(urls: string[]): Record<string, ProbeResult> {
	const [results, setResults] = useState<Record<string, ProbeResult>>({});
	const key = urls.join("\n");

	useEffect(() => {
		if (!key) return;
		let cancelled = false;
		const probeAll = () => {
			for (const url of key.split("\n"))
				void probeHealth(url).then((result) => {
					if (!cancelled) setResults((prev) => ({ ...prev, [url]: result }));
				});
		};
		probeAll();
		const timer = setInterval(probeAll, PROBE_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(timer);
		};
	}, [key]);

	return results;
}
