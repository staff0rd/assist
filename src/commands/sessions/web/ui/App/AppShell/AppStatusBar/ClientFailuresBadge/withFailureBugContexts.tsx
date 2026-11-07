import type { ReactNode } from "react";
import { vi } from "vitest";
import {
	type RepoSelection,
	RepoSelectionContext,
} from "../../../../useRepoSelectionContext";
import { SessionLaunchContext } from "../../../../useSessionLaunchContext";

export function withFailureBugContexts(
	origins: Record<string, string>,
	children: ReactNode,
	cloneOn: RepoSelection["cloneOn"] = (cwd) => cwd,
) {
	const launchAssist = vi.fn();
	const selection: RepoSelection = {
		repos: Object.keys(origins),
		selectedCwd: "/git/selected",
		selectedNode: "mac",
		worktreeCwd: "/git/selected",
		setSelectedCwd: () => {},
		cloneOn,
		originOf: (cwd) => origins[cwd],
	};
	const ui = (
		<RepoSelectionContext.Provider value={selection}>
			<SessionLaunchContext.Provider
				value={{
					launchAssist,
					launchAgentInStream: () => {},
					resumeSession: () => {},
					armUpdateReload: () => {},
					activateSession: () => {},
					sendInput: () => {},
				}}
			>
				{children}
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>
	);
	return { ui, launchAssist };
}
