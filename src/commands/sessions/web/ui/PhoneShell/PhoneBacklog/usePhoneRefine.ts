import { useState } from "react";
import { refineFeature } from "../../../../../../shared/harnessAdapters/harnessFeatures";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import { formatItemId } from "../../../../../backlog/formatItemId";
import type { HarnessCapabilities } from "../../parseHarnessCapabilities";
import type { AssistLaunchMeta } from "../../resumeSessionAction";
import type { SessionSocket } from "../../useSessionSocket";
import { useLaunchLanding } from "./useLaunchLanding";
import { refinesItem } from "./refinesItem";

type RefineTarget = {
	cwd?: string;
	node?: string;
	harness: HarnessKind;
	capabilities: HarnessCapabilities;
};

export function usePhoneRefine(
	socket: Pick<SessionSocket, "sessions" | "createAssistSession">,
	itemId: number,
	{ cwd, node, harness, capabilities }: RefineTarget,
) {
	const [existing, setExisting] = useState<string[]>();
	const created = existing
		? socket.sessions.find(
				(session) =>
					refinesItem(session, itemId, { cwd, node }) &&
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
			setExisting(
				socket.sessions
					.filter((session) => refinesItem(session, itemId, { cwd, node }))
					.map((session) => session.id),
			);
			latch();
			const meta: [AssistLaunchMeta?] = node ? [{ node }] : [];
			// The repo's own harness.engine can differ from the capabilities endpoint's, so the harness is always explicit.
			socket.createAssistSession(
				["refine", "--once", "--harness", harness, formatItemId(itemId)],
				cwd,
				...meta,
			);
		},
	};
}
