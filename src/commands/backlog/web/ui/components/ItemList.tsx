import { useState } from "react";
import { useNavigate } from "react-router";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import { itemDetailPath } from "../itemDetailPath";
import type { BacklogItemSummary } from "../types";
import { useRepoCwd } from "../useRepoCwd";
import { useSearchItems } from "../useSearchItems";
import { ListBody } from "./ListBody";
import { RepoSummaryChips } from "./RepoSummaryChips";
import { SearchInput } from "./SearchInput";
import { type TypeFilterValue } from "./TypeFilter";
import { Header } from "./Header";

type ItemListProps = {
	items: BacklogItemSummary[];
	loading: boolean;
	socket: SessionSocket;
	onReload: () => Promise<void>;
};

export function ItemList({ items, loading, socket, onReload }: ItemListProps) {
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	const { query, setQuery, results, loading: searching } = useSearchItems();
	const [typeFilter, setTypeFilter] = useState<TypeFilterValue>("all");
	const visible = results ?? items;
	const filtered =
		typeFilter === "all"
			? visible
			: visible.filter((item) => item.type === typeFilter);

	return (
		<>
			<Header typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} />
			<SearchInput value={query} onChange={setQuery} />
			<RepoSummaryChips />
			<ListBody
				loading={loading || searching}
				query={query}
				typeFilter={typeFilter}
				items={filtered}
				socket={socket}
				onSelect={(item) => navigate(itemDetailPath(item.id, cwd))}
				onReload={onReload}
			/>
		</>
	);
}
