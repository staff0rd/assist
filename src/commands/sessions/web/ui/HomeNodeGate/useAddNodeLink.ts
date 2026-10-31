import { useCallback, useState } from "react";
import type { NodeHealth } from "./probeHealth";
import type { SavedNode } from "./SavedNode";
import { resolveAddNodeLink } from "./useAddNodeLink/resolveAddNodeLink";
import { useAppUrls } from "./useAddNodeLink/useAppUrls";

export type AddNodeLinkStatus =
	| { kind: "idle" }
	| { kind: "probing"; name: string }
	| { kind: "error"; message: string };

export function useAddNodeLink(
	adoptNode: (node: SavedNode, health: NodeHealth) => void,
) {
	const [status, setStatus] = useState<AddNodeLinkStatus>({ kind: "idle" });

	useAppUrls(async (link) => {
		const result = await resolveAddNodeLink(link, (node) =>
			setStatus({ kind: "probing", name: node.name }),
		);
		if (!result.ok) {
			setStatus({ kind: "error", message: result.error });
			return;
		}
		adoptNode(result.node, result.health);
		setStatus({ kind: "idle" });
	});

	const dismiss = useCallback(() => setStatus({ kind: "idle" }), []);

	return { status, dismiss };
}
