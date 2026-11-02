import type { ReactNode } from "react";
import { ApiNodeContext } from "../../useApiNode";
import { NodeSelectionContext } from "../../useNodeSelectionContext";
import { RepoSelectionContext } from "../../useRepoSelectionContext";
import { SessionLaunchContext } from "../../useSessionLaunchContext";
import { useNodeUpdates } from "./AppShellProviders/useNodeUpdates";
import { NodeUpdatesContext } from "./useNodeUpdatesContext";
import { LocalRestartContext } from "./useLocalRestartContext";
import { useWebserverRestart } from "./useWebserverRestart";
import { SidebarCollapsedContext } from "../useSidebarCollapsedContext";
import { HistorySearchQueryProvider } from "../useHistorySearchQuery";
import type { useAppShell } from "./useAppShell";

export function AppShellProviders({
	shell,
	children,
}: {
	shell: ReturnType<typeof useAppShell>;
	children: ReactNode;
}) {
	const { socket, selection, launch, sidebarCollapse } = shell;
	const updates = useNodeUpdates(socket.nodeSelection);
	const localRestart = useWebserverRestart("webserver", socket.reconnecting);
	return (
		<NodeUpdatesContext.Provider value={updates}>
			<LocalRestartContext.Provider value={localRestart}>
				<SidebarCollapsedContext.Provider value={sidebarCollapse}>
					<RepoSelectionContext.Provider value={selection}>
						<NodeSelectionContext.Provider value={socket.nodeSelection}>
							<ApiNodeContext.Provider value={selection.selectedNode}>
								<SessionLaunchContext.Provider value={launch}>
									<HistorySearchQueryProvider>
										{children}
									</HistorySearchQueryProvider>
								</SessionLaunchContext.Provider>
							</ApiNodeContext.Provider>
						</NodeSelectionContext.Provider>
					</RepoSelectionContext.Provider>
				</SidebarCollapsedContext.Provider>
			</LocalRestartContext.Provider>
		</NodeUpdatesContext.Provider>
	);
}
