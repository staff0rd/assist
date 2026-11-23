import { Route, Routes } from "react-router";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import type { OptimisticMove } from "../useOptimisticMove";
import { ItemList } from "./ItemList";
import { ItemRoute } from "./ItemRoute";

type ViewRouterProps = {
	items: BacklogItemSummary[];
	loading: boolean;
	error: string | null;
	socket: SessionSocket;
	onReload: () => Promise<void>;
	onMove: OptimisticMove;
};

export function ViewRouter({
	items,
	loading,
	error,
	socket,
	onReload,
	onMove,
}: ViewRouterProps) {
	return (
		<Routes>
			<Route
				index
				element={
					<ItemList
						items={items}
						loading={loading}
						error={error}
						socket={socket}
						onReload={onReload}
						onMove={onMove}
					/>
				}
			/>
			<Route path="items/:id" element={<ItemRoute onReload={onReload} />} />
		</Routes>
	);
}
