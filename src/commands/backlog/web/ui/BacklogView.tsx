import { Route, Routes } from "react-router";
import { EmptyBacklog } from "./components/EmptyBacklog";
import { ViewRouter } from "./components/ViewRouter";
import { useBacklogItems } from "./useBacklogItems";

export function BacklogView() {
	const { items, loading, exists, reload, initialize } = useBacklogItems();

	if (!exists) return <EmptyBacklog onInit={initialize} />;

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
