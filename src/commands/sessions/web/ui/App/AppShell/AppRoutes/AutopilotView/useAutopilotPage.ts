import { useEffect, useState } from "react";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useAutopilotActions } from "./useAutopilotActions";
import { useAutopilotCwd } from "./useAutopilotCwd";
import { useAutopilotStatus } from "./useAutopilotStatus";

export function useAutopilotPage() {
	const { selectedCwd } = useRepoSelectionContext();
	const [unscheduled, setUnscheduled] = useState(false);
	const page = useAutopilotCwd(unscheduled);
	const { state, refresh, patch } = useAutopilotStatus(page.cwd);
	useEffect(() => {
		setUnscheduled(
			!state.loading &&
				!state.status &&
				!state.error &&
				page.cwd === selectedCwd,
		);
	}, [state, page.cwd, selectedCwd]);
	const target = state.loading ? { cwd: page.cwd } : state.target;
	const actions = useAutopilotActions(target.cwd, target.node, refresh, patch);
	return { page, state, target, actions };
}
