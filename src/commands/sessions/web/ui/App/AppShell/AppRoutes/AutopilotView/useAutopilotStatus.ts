import { useCallback, useEffect, useState } from "react";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { useApiNode } from "../../../../useApiNode";
import { useNodeSelectionContext } from "../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import {
	type ResolvedAutopilotStatus,
	resolveAutopilotStatus,
} from "./resolveAutopilotStatus";

const POLL_MS = 15_000;

type AutopilotStatusState =
	| { loading: true }
	| ({ loading: false } & ResolvedAutopilotStatus);

export function useAutopilotStatus(cwd: string) {
	const node = useApiNode();
	const localNode = useNodeSelectionContext().nodes?.local;
	const { cloneOn } = useRepoSelectionContext();
	const [state, setState] = useState<AutopilotStatusState>({ loading: true });

	const refresh = useCallback(async () => {
		if (!cwd) return;
		const resolved = await resolveAutopilotStatus(
			{ cwd, node },
			localNode,
			(repoCwd, onNode) => cloneOn(repoCwd, onNode),
		);
		setState({ loading: false, ...resolved });
	}, [cwd, node, localNode, cloneOn]);

	useEffect(() => {
		void refresh();
		const timer = setInterval(() => void refresh(), POLL_MS);
		return () => clearInterval(timer);
	}, [refresh]);

	const patch = useCallback(
		(update: (status: AutopilotStatus) => AutopilotStatus) =>
			setState((current) =>
				!current.loading && current.status
					? { ...current, status: update(current.status) }
					: current,
			),
		[],
	);

	return { state, refresh, patch };
}
