import { useCallback } from "react";
import { toNodeSessionId } from "../../../../../../daemon/links/splitNodeSessionId";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { useNodeUpdatesContext } from "../../useNodeUpdatesContext";
import { useActivateSession } from "../useActivateSession";
import { useLoopControl } from "./useUpdateActions/useLoopControl";
import { useNodeRestart } from "./useUpdateActions/useNodeRestart";
import { useNotices } from "./useUpdateActions/useNotices";

export function useUpdateActions(
	reconnecting: boolean,
	selectSession: (id: string) => void,
) {
	const { refresh } = useNodeUpdatesContext();
	const notices = useNotices();
	const restarts = useNodeRestart(reconnecting, notices, refresh);
	const loop = useLoopControl(notices, refresh);
	const activate = useActivateSession(selectSession);

	const openFix = useCallback(
		(entry: NodeUpdateEntry) => {
			const id = entry.status?.loop.escalationId;
			if (id) activate(entry.local ? id : toNodeSessionId(entry.name, id));
		},
		[activate],
	);

	return { ...restarts, ...loop, openFix, notices };
}

export type UpdateActions = ReturnType<typeof useUpdateActions>;
