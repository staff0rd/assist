import {
	buildFeature,
	refineFeature,
} from "../../../../../../shared/harnessAdapters/harnessFeatures";
import { canPlay } from "../../../../../backlog/web/ui/components/canPlay";
import { launchBuild } from "../../../../../backlog/web/ui/components/launchBuild";
import { runInFlightSession } from "../../../../../backlog/web/ui/components/runInFlightSession";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import type { SessionSocket } from "../../useSessionSocket";
import type { BacklogItemScope } from "./backlogItemPath";
import { useLaunchLanding } from "./useLaunchLanding";
import { usePhoneHarness } from "./usePhoneHarness";
import { usePhoneNode } from "./usePhoneNode";
import { usePhoneRefine } from "./usePhoneRefine";
import { useStartCwd } from "./useStartCwd";

export function usePhoneStart(
	socket: SessionSocket,
	item: BacklogItem,
	scope: BacklogItemScope,
) {
	const { remote, ...nodeChoice } = usePhoneNode(socket, scope);
	const { node } = nodeChoice;
	const playable = canPlay(item);
	const { harnessArgs, capabilities, ...harness } = usePhoneHarness(
		node,
		playable ? buildFeature.id : refineFeature.id,
	);
	const cwd = useStartCwd(socket, item.origin, scope, node);
	const inFlight = runInFlightSession(socket.sessions, item.id);
	const { launched, latch } = useLaunchLanding(inFlight);
	const refine = usePhoneRefine(socket, item.id, {
		cwd,
		node: remote,
		harness: harness.harness,
		capabilities,
	});

	return {
		...harness,
		...nodeChoice,
		cwd,
		playable,
		inFlight,
		launched,
		refine,
		start: () => {
			if (launched || !cwd) return;
			latch();
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
