import { useEffect, useState } from "react";
import type { ScopedRule } from "../../../../../../rules/types";
import { useApiNode } from "../../../useApiNode";

const EMPTY: ScopedRule[] = [];

export function useScopedRules(
	cwd: string | undefined,
	path: string | undefined,
	enabled: boolean,
): ScopedRule[] {
	const [rules, setRules] = useState<ScopedRule[]>(EMPTY);
	const node = useApiNode();

	useEffect(() => {
		if (!enabled || !cwd) {
			setRules(EMPTY);
			return;
		}
		let cancelled = false;
		const params = new URLSearchParams({ cwd });
		if (path) params.set("path", path);
		if (node) params.set("node", node);
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
	}, [cwd, path, enabled, node]);

	return rules;
}
