import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { parseItemId } from "../../../../../backlog/formatItemId";
import { fetchItem } from "../../../../../backlog/web/ui/fetchItem";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import type { BacklogItemScope } from "./backlogItemPath";

type ItemLoad =
	| { state: "loading" }
	| { state: "missing" }
	| { state: "error"; message: string }
	| { state: "loaded"; item: BacklogItem };

function routeItemId(raw: string | undefined): number | undefined {
	try {
		return raw ? parseItemId(raw) : undefined;
	} catch {
		return undefined;
	}
}

export function usePhoneBacklogItem() {
	const id = routeItemId(useParams().itemId);
	const [params] = useSearchParams();
	const cwd = params.get("cwd") ?? undefined;
	const node = params.get("node") ?? undefined;
	const [load, setLoad] = useState<ItemLoad>({ state: "loading" });

	useEffect(() => {
		if (id === undefined) {
			setLoad({ state: "missing" });
			return;
		}
		const controller = new AbortController();
		setLoad({ state: "loading" });
		fetchItem(id, { cwd, node }, controller.signal).then(
			(item) =>
				setLoad(item ? { state: "loaded", item } : { state: "missing" }),
			(error: unknown) => {
				if (controller.signal.aborted) return;
				const message = error instanceof Error ? error.message : String(error);
				setLoad({ state: "error", message });
			},
		);
		return () => controller.abort();
	}, [id, cwd, node]);

	const scope: BacklogItemScope = { cwd, node };
	return { id, scope, load };
}
