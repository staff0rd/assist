import { useState } from "react";
import { useAutopilotActions } from "../../App/AppShell/AppRoutes/AutopilotView/useAutopilotActions";
import { useAutopilotRepos } from "../../App/AppShell/AppRoutes/AutopilotView/useAutopilotRepos";
import { useResolvedAutopilotStatus } from "../../App/AppShell/AppRoutes/AutopilotView/useResolvedAutopilotStatus";
import type { SessionSocket } from "../../useSessionSocket";
import { useSocketCloneOn } from "./useSocketCloneOn";

export type PhoneAutopilot = ReturnType<typeof usePhoneAutopilot>;

export function usePhoneAutopilot(socket: SessionSocket) {
	const repos = useAutopilotRepos();
	const [picked, setPicked] = useState<string>();
	const fallback = repos.includes(socket.currentCwd)
		? socket.currentCwd
		: repos[0];
	const cwd = (picked && repos.includes(picked) ? picked : fallback) ?? "";
	const cloneOn = useSocketCloneOn(socket);
	const { state, refresh, patch } = useResolvedAutopilotStatus(
		cwd,
		undefined,
		socket.nodes?.local,
		cloneOn,
	);
	const target = state.loading ? { cwd } : state.target;
	const actions = useAutopilotActions(target.cwd, target.node, refresh, patch);
	const failed = !state.loading && !!state.status?.failure;
	return { repos, cwd, pick: setPicked, state, actions, failed };
}
