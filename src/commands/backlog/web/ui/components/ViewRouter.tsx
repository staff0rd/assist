import { Route, Routes } from "react-router";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { ItemList } from "./ItemList";
import { ItemRoute } from "./ItemRoute";

type ViewRouterProps = {
	items: BacklogItemSummary[];
	loading: boolean;
	socket: SessionSocket;
	onReload: () => Promise<void>;
};

export function ViewRouter({
	items,
	loading,
	socket,
	onReload,
}: ViewRouterProps) {
	return (
		<Routes>
			<Route
				index
				element={
					<ItemList
						items={items}
						loading={loading}
						socket={socket}
						onReload={onReload}
					/>
				}
			/>
			<Route path="items/:id" element={<ItemRoute onReload={onReload} />} />
		</Routes>
	);
}
