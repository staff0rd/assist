import { useEffect, useState } from "react";
import type { SessionInfo } from "../../../../types";
import { useNodeSelectionContext } from "../../../../useNodeSelectionContext";
import { useSessionLaunchContext } from "../../../../useSessionLaunchContext";
import { postRestart } from "../../postRestart";
import { useUpdateCompletion } from "../../useUpdateCompletion";
import { useAwaitPeerReturn } from "./useAwaitPeerReturn";

const describeUpdated = (peer: string, version?: string) =>
	version ? `${peer} updated to v${version}` : `${peer} updated`;

function postSelfUpdate(peer: string): Promise<Response> {
	return fetch(`/api/self-update?node=${encodeURIComponent(peer)}`, {
		method: "POST",
	});
}

export function usePeerUpdate(sessions: SessionInfo[]) {
	const { nodes } = useNodeSelectionContext();
	const { launchAssist } = useSessionLaunchContext();
	const { requestThenAwait, ...notices } = useAwaitPeerReturn();
	const [progress, setProgress] = useState<string | null>(null);
	const [updating, setUpdating] = useState<string>();
	const linkState = (peer?: string) =>
		nodes?.links.find((l) => l.name === peer)?.state;
	const { arm, completed } = useUpdateCompletion(
		sessions,
		linkState(updating) !== "connected",
		updating,
	);

	useEffect(() => {
		if (!completed || !updating) return;
		setUpdating(undefined);
		void requestThenAwait(
			updating,
			`Restart ${updating}'s web server`,
			() => postRestart("webserver", updating),
			describeUpdated,
		);
	}, [completed, updating, requestThenAwait]);

	const selfUpdate = async (peer: string) => {
		setProgress(`Updating assist on ${peer}…`);
		await requestThenAwait(
			peer,
			`Update ${peer}`,
			() => postSelfUpdate(peer),
			describeUpdated,
		);
		setProgress(null);
	};

	const update = (peer: string) => {
		if (linkState(peer) !== "connected") {
			void selfUpdate(peer);
			return;
		}
		setUpdating(peer);
		arm();
		launchAssist(["update"], undefined, { node: peer });
	};

	return { update, progress, ...notices };
}
