import { useNodeUpdates } from "../../App/AppShell/AppShellProviders/useNodeUpdates";
import { useLoopControl } from "../../App/AppShell/AppRoutes/UpdatesView/useUpdateActions/useLoopControl";
import { useNodeRestart } from "../../App/AppShell/AppRoutes/UpdatesView/useUpdateActions/useNodeRestart";
import { useNotices } from "../../App/AppShell/AppRoutes/UpdatesView/useUpdateActions/useNotices";
import type { NodeSelection } from "../../useNodeSelection";
import { latestVersion } from "./latestVersion";
import { useSelfUpdate } from "./useSelfUpdate";

export function usePhoneNodeUpdates(
	selection: NodeSelection,
	reconnecting: boolean,
) {
	const { entries, refresh } = useNodeUpdates(selection);
	const notices = useNotices();
	const { restart, localError, clearLocalError } = useNodeRestart(
		reconnecting,
		notices,
		refresh,
	);
	const { control } = useLoopControl(notices, refresh);
	const update = useSelfUpdate(notices, refresh);
	return {
		entries,
		latest: latestVersion(entries),
		notices,
		error: notices.error ?? localError,
		clearMessages: () => {
			notices.clearBack();
			notices.clearError();
			clearLocalError();
		},
		restart,
		update,
		check: (entry: (typeof entries)[number]) => control(entry, "check"),
	};
}

export type PhoneNodeUpdates = ReturnType<typeof usePhoneNodeUpdates>;
