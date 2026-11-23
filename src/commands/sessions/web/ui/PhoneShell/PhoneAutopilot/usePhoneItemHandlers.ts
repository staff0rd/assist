import { useNavigate } from "react-router";
import { toNodeSessionId } from "../../../../daemon/links/splitNodeSessionId";
import { backlogItemPath } from "../PhoneBacklog/backlogItemPath";
import type { PhoneItemHandlers } from "./PhoneItemHandlers";
import type { PhoneAutopilot } from "./usePhoneAutopilot";

export function usePhoneItemHandlers({
	state,
	actions,
}: PhoneAutopilot): PhoneItemHandlers {
	const navigate = useNavigate();
	const target = state.loading ? undefined : state.target;
	const node = target?.node;
	return {
		busy: actions.busy,
		onItem: (itemId) =>
			navigate(backlogItemPath(itemId, { cwd: target?.cwd, node })),
		onStop: (itemId) => void actions.run("stop", itemId),
		onResume: (itemId) => void actions.run("resume-item", itemId),
		onOpen: (sessionId) =>
			navigate(
				`/session/${node ? toNodeSessionId(node, sessionId) : sessionId}`,
			),
	};
}
