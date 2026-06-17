import { Route, Routes } from "react-router";
import type { BacklogItemSummary } from "../types";
import { ItemList } from "./ItemList";
import { ItemRoute } from "./ItemRoute";

type ViewRouterProps = {
	items: BacklogItemSummary[];
	loading: boolean;
	onReload: () => Promise<void>;
};

export function ViewRouter({ items, loading, onReload }: ViewRouterProps) {
	return (
		<Routes>
			<Route
				index
				element={
					<ItemList items={items} loading={loading} onReload={onReload} />
				}
			/>
			<Route
				path="items/:id"
				element={<ItemRoute mode="detail" onReload={onReload} />}
			/>
			<Route
				path="items/:id/edit"
				element={<ItemRoute mode="edit" onReload={onReload} />}
			/>
		</Routes>
	);
}
