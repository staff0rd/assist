import { Route, Routes } from "react-router";
import type { BacklogItem } from "../types";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";
import { ItemRoute } from "./ItemRoute";

type ViewRouterProps = {
	items: BacklogItem[];
	onReload: () => Promise<void>;
};

export function ViewRouter({ items, onReload }: ViewRouterProps) {
	return (
		<Routes>
			<Route index element={<ItemList items={items} />} />
			<Route
				path="items/:id"
				element={<ItemRoute items={items} mode="detail" onReload={onReload} />}
			/>
			<Route
				path="items/:id/edit"
				element={<ItemRoute items={items} mode="edit" onReload={onReload} />}
			/>
			<Route
				path="add"
				element={<ItemForm onReload={onReload} backTo="/backlog" />}
			/>
		</Routes>
	);
}
