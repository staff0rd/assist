import { useEffect, useState } from "react";
import type { ScopedRule } from "../../../../../../../../rules/types";

const EMPTY: ScopedRule[] = [];

export function useScopedRules(
	cwd: string | undefined,
	path: string | undefined,
	enabled: boolean,
): ScopedRule[] {
	const [rules, setRules] = useState<ScopedRule[]>(EMPTY);

	useEffect(() => {
		if (!enabled || !cwd) {
			setRules(EMPTY);
			return;
		}
		let cancelled = false;
		const params = new URLSearchParams({ cwd });
		if (path) params.set("path", path);
		const load = async () => {
			try {
				const res = await fetch(`/api/rules?${params}`);
				const body = await res.json();
				if (!cancelled) setRules(body?.rules ?? EMPTY);
			} catch {
				if (!cancelled) setRules(EMPTY);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [cwd, path, enabled]);

	return rules;
}
