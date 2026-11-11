import { useState } from "react";
import { refineFeature } from "../../../../../../shared/harnessAdapters/harnessFeatures";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import { formatItemId } from "../../../../../backlog/formatItemId";
import { refineItemId } from "../../../../../backlog/refineItemId";
import type { HarnessCapabilities } from "../../parseHarnessCapabilities";
import type { AssistLaunchMeta } from "../../resumeSessionAction";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { useLaunchLanding } from "./useLaunchLanding";

type RefineTarget = {
	cwd?: string;
	node?: string;
	harness: HarnessKind;
	capabilities: HarnessCapabilities;
};

function refineSessionIds(sessions: SessionInfo[], itemId: number): string[] {
	return sessions
		.filter((session) => refineItemId(session.assistArgs) === itemId)
		.map((session) => session.id);
}

export function usePhoneRefine(
	socket: Pick<SessionSocket, "sessions" | "createAssistSession">,
	itemId: number,
	{ cwd, node, harness, capabilities }: RefineTarget,
) {
	const [existing, setExisting] = useState<string[]>();
	const created = existing
		? socket.sessions.find(
				(session) =>
					refineItemId(session.assistArgs) === itemId &&
					!existing.includes(session.id),
			)
		: undefined;
	const { launched, latch } = useLaunchLanding(created);
	const supported =
		capabilities.features[refineFeature.id]?.[harness]?.available === true;

	return {
		supported,
		launched,
		refine: () => {
			if (launched || !cwd || !supported) return;
			setExisting(refineSessionIds(socket.sessions, itemId));
			latch();
			const harnessArgs =
				harness === capabilities.engine ? [] : ["--harness", harness];
			const meta: [AssistLaunchMeta?] = node ? [{ node }] : [];
			socket.createAssistSession(
				["refine", "--once", ...harnessArgs, formatItemId(itemId)],
				cwd,
				...meta,
			);
		},
	};
}
