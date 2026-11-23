import { useState } from "react";
import type { BacklogItemSummary } from "../types";
import { useBacklogFilter } from "../useBacklogFilter";
import { useSearchItems } from "../useSearchItems";
import { isReorderable } from "./isReorderable";
import type { TypeFilterValue } from "./TypeFilter";

export function useListFilters(items: BacklogItemSummary[]) {
	const [filter] = useBacklogFilter();
	const { query, setQuery, results, loading } = useSearchItems();
	const [typeFilter, setTypeFilter] = useState<TypeFilterValue>("all");
	const visible = results ?? items;
	const filtered =
		typeFilter === "all"
			? visible
			: visible.filter((item) => item.type === typeFilter);
	return {
		query,
		setQuery,
		searching: loading,
		searched: results !== null,
		typeFilter,
		setTypeFilter,
		filtered,
		reorderable: isReorderable(filter, query, typeFilter),
	};
}
