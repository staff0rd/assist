import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { fetchItems } from "./api";
import { ViewRouter } from "./components/ViewRouter";
import type { BacklogItem } from "./types";

export function BacklogView() {
	const [items, setItems] = useState<BacklogItem[]>([]);
	const [loading, setLoading] = useState(true);

	const reload = useCallback(async () => {
		setItems(await fetchItems());
		setLoading(false);
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	return (
		<Routes>
			<Route
				path="/*"
				element={
					<ViewRouter items={items} loading={loading} onReload={reload} />
				}
			/>
		</Routes>
	);
}
