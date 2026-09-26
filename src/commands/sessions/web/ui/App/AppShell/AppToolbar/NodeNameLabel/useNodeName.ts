import { useEffect, useState } from "react";

export function useNodeName(): string | null {
	const [nodeName, setNodeName] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/health");
				const body = await res.json();
				if (!cancelled && typeof body?.nodeName === "string")
					setNodeName(body.nodeName);
			} catch {}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return nodeName;
}
