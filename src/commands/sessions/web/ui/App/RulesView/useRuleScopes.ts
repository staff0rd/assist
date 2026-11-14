import { useEffect, useState } from "react";
import type { RuleScope } from "../../../../../rules/types";
import { apiFetch } from "../../apiFetch";
import { useApiNode } from "../../useApiNode";
import { withNode } from "../../withNode";

type RuleScopesView = {
	scopes: RuleScope[];
	loading: boolean;
	error: string | null;
};

const LOADING: RuleScopesView = { scopes: [], loading: true, error: null };

async function fetchScopes(cwd: string, node?: string): Promise<RuleScope[]> {
	const res = await apiFetch(
		withNode(`/api/rules/scopes?cwd=${encodeURIComponent(cwd)}`, node),
	);
	const body = await res.json();
	if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
	return body.scopes ?? [];
}

export function useRuleScopes(cwd: string): RuleScopesView {
	const [state, setState] = useState<RuleScopesView>(LOADING);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setState({ scopes: [], loading: false, error: "No repo selected." });
			return;
		}
		let cancelled = false;
		setState(LOADING);
		fetchScopes(cwd, node)
			.then((scopes) => {
				if (!cancelled) setState({ scopes, loading: false, error: null });
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setState({
					scopes: [],
					loading: false,
					error:
						error instanceof Error ? error.message : "Failed to load rules.",
				});
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	return state;
}
