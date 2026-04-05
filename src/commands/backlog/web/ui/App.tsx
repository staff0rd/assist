import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { fetchItems } from "./api";
import { ViewRouter } from "./components/ViewRouter";
import type { BacklogItem } from "./types";

export function App() {
	const [items, setItems] = useState<BacklogItem[]>([]);

	const reload = useCallback(async () => {
		setItems(await fetchItems());
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/*"
					element={<ViewRouter items={items} onReload={reload} />}
				/>
			</Routes>
		</BrowserRouter>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
