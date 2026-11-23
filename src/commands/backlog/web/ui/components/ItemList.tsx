import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import { itemDetailPath } from "../itemDetailPath";
import type { BacklogItemSummary } from "../types";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import type { OptimisticMove } from "../useOptimisticMove";
import { useRepoCwd } from "../useRepoCwd";
import { ListBody } from "./ListBody";
import { RepoSummaryChips } from "./RepoSummaryChips";
import { SearchInput } from "./SearchInput";
import { Header } from "./Header";
import { useListFilters } from "./useListFilters";

type ItemListProps = {
	items: BacklogItemSummary[];
	loading: boolean;
	error: string | null;
	socket: SessionSocket;
	onReload: () => Promise<void>;
	onMove?: OptimisticMove;
};

export function ItemList({
	items,
	loading,
	error,
	socket,
	onReload,
	onMove,
}: ItemListProps) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const list = useListFilters(items);

	return (
		<>
			<Header
				typeFilter={list.typeFilter}
				onTypeFilterChange={list.setTypeFilter}
				revision={items}
			/>
			<SearchInput value={list.query} onChange={list.setQuery} />
			<RepoSummaryChips sessions={socket.sessions} />
			<ListBody
				loading={loading || list.searching}
				error={list.searched ? null : error}
				query={list.query}
				typeFilter={list.typeFilter}
				items={list.filtered}
				socket={socket}
				itemPath={(item) => itemDetailPath(item.id, cwd, node)}
				onReload={onReload}
				onMove={list.reorderable ? onMove : undefined}
			/>
		</>
	);
}
