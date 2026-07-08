import { useEffect, useState } from "react";

export function useJiraSite(): string | null {
	const [site, setSite] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/jira-site");
				const body = await res.json();
				if (!cancelled) setSite(body?.site ?? null);
			} catch {
				if (!cancelled) setSite(null);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return site;
}
