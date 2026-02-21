import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { fetchItems } from "./api";
import { type View, ViewRouter } from "./components/ViewRouter";
import type { BacklogItem } from "./types";

export function App() {
	const [items, setItems] = useState<BacklogItem[]>([]);
	const [view, setView] = useState<View>({ kind: "list" });

	const reload = useCallback(async () => {
		setItems(await fetchItems());
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	const handleReloadAndNavigate = useCallback(
		async (next: View) => {
			await reload();
			setView(next);
		},
		[reload],
	);

	return (
		<ViewRouter
			view={view}
			items={items}
			onNavigate={setView}
			onReloadAndNavigate={handleReloadAndNavigate}
		/>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
