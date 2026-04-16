import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { fetchItems } from "./api";
import { ViewRouter } from "./components/ViewRouter";
import type { BacklogItem } from "./types";

export function BacklogView() {
	const [items, setItems] = useState<BacklogItem[]>([]);

	const reload = useCallback(async () => {
		setItems(await fetchItems());
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	return (
		<Routes>
			<Route
				path="/*"
				element={<ViewRouter items={items} onReload={reload} />}
			/>
		</Routes>
	);
}
