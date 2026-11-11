import { useSearchParams } from "react-router";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";
import { configSources } from "./configSourceLabel";
import { parseScopeParam } from "./parseScopeParam";

export function useConfigScopeParam() {
	const [searchParams, setSearchParams] = useSearchParams();
	const scopes = parseScopeParam(searchParams.get("scope"));

	const toggle = (source: ConfigSource) => {
		const next = new Set(scopes);
		if (next.has(source)) next.delete(source);
		else next.add(source);
		setSearchParams(
			(params) => {
				const value = configSources.filter((s) => next.has(s)).join(",");
				if (value) params.set("scope", value);
				else params.delete("scope");
				return params;
			},
			{ replace: true },
		);
	};

	return { scopes, toggle };
}
