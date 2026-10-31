import { useState } from "react";
import { launchBuild } from "../../../../../backlog/web/ui/components/launchBuild";
import { runInFlightSession } from "../../../../../backlog/web/ui/components/runInFlightSession";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import type { SessionSocket } from "../../useSessionSocket";
import type { BacklogItemScope } from "./backlogItemPath";
import { useLaunchLanding } from "./useLaunchLanding";
import { usePhoneHarness } from "./usePhoneHarness";
import { useStartCwd } from "./useStartCwd";

export function usePhoneStart(
	socket: SessionSocket,
	item: BacklogItem,
	scope: BacklogItemScope,
) {
	const { names, visible } = socket.nodeSelection;
	const localNode = socket.nodes?.local;
	const [pickedNode, setPickedNode] = useState(scope.node ?? localNode);
	const harness = usePhoneHarness();
	const node =
		pickedNode && names.includes(pickedNode) ? pickedNode : localNode;
	const cwd = useStartCwd(socket, item.origin, scope, node);
	const inFlight = runInFlightSession(socket.sessions, item.id);
	const { launched, latch } = useLaunchLanding(inFlight);
	const harnessArgs =
		harness.harness === "claude" ? [] : ["--harness", harness.harness];

	return {
		...harness,
		node,
		setNode: setPickedNode,
		nodes: visible ? names : [],
		links: socket.nodes?.links ?? [],
		cwd,
		inFlight,
		launched,
		start: () => {
			if (launched || !cwd) return;
			latch();
			const remote = node !== localNode ? node : undefined;
			launchBuild(
				socket.createAssistSession,
				item.id,
				{ cwd, node: remote },
				harnessArgs,
			);
		},
	};
}

export type PhoneStart = ReturnType<typeof usePhoneStart>;
