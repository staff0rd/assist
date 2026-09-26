import { Box, CircularProgress } from "@mui/material";
import { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { countRender } from "../../../../sessions/web/ui/renderCounters";
import { ApiNodeContext } from "../../../../sessions/web/ui/useApiNode";
import {
	RepoSelectionContext,
	useRepoSelectionContext,
} from "../../../../sessions/web/ui/useRepoSelectionContext";
import { parseItemId } from "../../../formatItemId";
import { useItem } from "../useItem";
import { ItemDetail } from "./ItemDetail";

const loadingSx = {
	display: "flex",
	justifyContent: "center",
	py: 6,
} as const;

export function ItemRoute({ onReload }: { onReload: () => Promise<void> }) {
	const [searchParams] = useSearchParams();
	const cwdParam = searchParams.get("cwd") || undefined;
	const nodeParam = searchParams.get("node") || undefined;
	const selection = useRepoSelectionContext();
	const value = useMemo(
		() =>
			cwdParam
				? { ...selection, selectedCwd: cwdParam, selectedNode: nodeParam }
				: selection,
		[selection, cwdParam, nodeParam],
	);
	countRender("ItemRoute");

	return (
		<RepoSelectionContext.Provider value={value}>
			<ApiNodeContext.Provider value={value.selectedNode}>
				<ItemRouteContent onReload={onReload} />
			</ApiNodeContext.Provider>
		</RepoSelectionContext.Provider>
	);
}

function ItemRouteContent({ onReload }: { onReload: () => Promise<void> }) {
	const { id } = useParams<{ id: string }>();
	let numId = Number.NaN;
	try {
		numId = parseItemId(id ?? "");
	} catch {
		numId = Number.NaN;
	}
	const { item, loading, reload } = useItem(numId);

	// Refresh both the open item and the list summary so status/edits made here
	// are reflected when navigating back.
	const handleReload = useCallback(async () => {
		await Promise.all([reload(), onReload()]);
	}, [reload, onReload]);

	if (loading) {
		return (
			<Box sx={loadingSx}>
				<CircularProgress />
			</Box>
		);
	}
	if (!item) return null;

	return <ItemDetail item={item} onReload={handleReload} />;
}
