import { useState } from "react";
import { useSearchParams } from "react-router";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import { filterConfigEntries } from "./filterConfigEntries";
import { groupConfigEntries } from "./groupConfigEntries";
import { useConfigScopeParam } from "./useConfigScopeParam";

export function useConfigFilters(entries: ConfigEntry[]) {
	const [searchParams] = useSearchParams();
	const [search, setSearch] = useState(searchParams.get("search") ?? "");
	const { scopes, toggle } = useConfigScopeParam();
	const groups = groupConfigEntries(
		filterConfigEntries(entries, search, scopes),
	);
	return { search, setSearch, scopes, toggle, groups };
}
