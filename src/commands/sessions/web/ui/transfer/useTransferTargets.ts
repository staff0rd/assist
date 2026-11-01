import { useEffect, useState } from "react";
import {
	fetchLocations,
	type RepoLocation,
} from "../useNodeClones/useCloneLocations/fetchLocations";
import type { NodesState, SessionInfo } from "../types";
import { transferCandidates } from "./transferCandidates";

type TransferTarget = { node: string; cwd: string };

export function useTransferTargets(
	session: SessionInfo,
	nodes: NodesState | null,
	enabled: boolean,
): TransferTarget[] | null {
	const [targets, setTargets] = useState<TransferTarget[] | null>(null);
	const origin = session.repoGroup?.origin;
	const key = transferCandidates(session, nodes).join("\0");

	useEffect(() => {
		if (!enabled || !origin || !key || !nodes) return;
		let cancelled = false;
		setTargets(null);
		const candidates = key.split("\0");
		const asApiNode = (node: string) => (node === nodes.local ? "" : node);
		fetchLocations(origin, candidates.map(asApiNode)).then((entries) => {
			if (cancelled) return;
			setTargets(
				entries.flatMap(([apiNode, location]) => {
					const { cwd } = location as RepoLocation;
					return cwd ? [{ node: apiNode || nodes.local, cwd }] : [];
				}),
			);
		});
		return () => {
			cancelled = true;
		};
	}, [enabled, origin, key, nodes]);

	return key ? targets : [];
}
