import type { ReactNode } from "react";
import { ApiNodeContext } from "../../useApiNode";
import { NodeSelectionContext } from "../../useNodeSelectionContext";
import { RepoSelectionContext } from "../../useRepoSelectionContext";
import { SessionLaunchContext } from "../../useSessionLaunchContext";
import { SidebarCollapsedContext } from "../useSidebarCollapsedContext";
import { TopBarLayoutContext } from "../useTopBarLayoutContext";
import type { useAppShell } from "./useAppShell";

export function AppShellProviders({
	shell,
	children,
}: {
	shell: ReturnType<typeof useAppShell>;
	children: ReactNode;
}) {
	const { socket, selection, launch, topBar, sidebarCollapse } = shell;
	return (
		<TopBarLayoutContext.Provider value={topBar}>
			<SidebarCollapsedContext.Provider value={sidebarCollapse}>
				<RepoSelectionContext.Provider value={selection}>
					<NodeSelectionContext.Provider value={socket.nodeSelection}>
						<ApiNodeContext.Provider value={selection.selectedNode}>
							<SessionLaunchContext.Provider value={launch}>
								{children}
							</SessionLaunchContext.Provider>
						</ApiNodeContext.Provider>
					</NodeSelectionContext.Provider>
				</RepoSelectionContext.Provider>
			</SidebarCollapsedContext.Provider>
		</TopBarLayoutContext.Provider>
	);
}
