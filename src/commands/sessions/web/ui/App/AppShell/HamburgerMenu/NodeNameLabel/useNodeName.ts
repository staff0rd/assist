import { useEffect, useState } from "react";
import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";

export function useNodeName(): string | null {
	const [nodeName, setNodeName] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch("/api/health");
				const body = await res.json();
				if (!cancelled && typeof body?.nodeName === "string")
					setNodeName(body.nodeName);
			} catch (error) {
				reportCaughtError(error, "node name");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return nodeName;
}
