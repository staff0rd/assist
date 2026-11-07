import type { SessionInfo } from "../../../types";
import { useSessionLaunchContext } from "../../../useSessionLaunchContext";
import { RESTART_ITEM } from "../postRestart";
import { useWebserverRestart } from "../useWebserverRestart";
import { usePeerRestart } from "./HamburgerMenuDialogs/usePeerRestart";
import { usePeerUpdate } from "./HamburgerMenuDialogs/usePeerUpdate";

export function useMenuActions(
	peer: string | undefined,
	sessions: SessionInfo[],
	reconnecting: boolean,
) {
	const { launchAssist, armUpdateReload } = useSessionLaunchContext();
	const localRestart = useWebserverRestart(RESTART_ITEM.target, reconnecting);
	const peerRestart = usePeerRestart();
	const peerUpdate = usePeerUpdate(sessions);

	return {
		localRestart,
		peerRestart,
		peerUpdate,
		restart: () => {
			if (peer) void peerRestart.restart(peer);
			else void localRestart.restart();
		},
		update: () => {
			if (peer) {
				peerUpdate.update(peer);
				return;
			}
			armUpdateReload();
			launchAssist(["update"]);
		},
	};
}

export type MenuActions = ReturnType<typeof useMenuActions>;
