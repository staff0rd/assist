import { type RefObject, useMemo } from "react";
import {
	createRunAction,
	inputAction,
	resizeAction,
	setAutoAdvanceAction,
	setAutoApproveAction,
	setStarredAction,
	stopSessionAction,
	transferSessionAction,
} from "../createSessionAction";
import { prDecisionAction } from "./useSessionActions/prDecisionAction";
import { useLaunchActions } from "./useSessionActions/useLaunchActions";
import { useLifecycleActions } from "./useSessionActions/useLifecycleActions";
import { outputAction } from "./useSessionActions/outputAction";

type SendFn = (msg: object) => void;
type OutputHandler = (data: string) => void;

export function useSessionActions(
	send: SendFn,
	buffers: RefObject<Map<string, string>>,
	handlers: RefObject<Map<string, OutputHandler>>,
) {
	const actions = {
		...useLaunchActions(send),
		sendInput: useMemo(() => inputAction(send), [send]),
		sendResize: useMemo(() => resizeAction(send), [send]),
		sendPrDecision: useMemo(() => prDecisionAction(send), [send]),
		setAutoApprove: useMemo(() => setAutoApproveAction(send), [send]),
		setAutoAdvance: useMemo(() => setAutoAdvanceAction(send), [send]),
		setStarred: useMemo(() => setStarredAction(send), [send]),
		stopSession: useMemo(() => stopSessionAction(send), [send]),
		startRun: useMemo(() => createRunAction(send), [send]),
		transferSession: useMemo(() => transferSessionAction(send), [send]),
	};

	const onOutput = useMemo(
		() => outputAction(send, buffers.current, handlers.current),
		[send, buffers, handlers],
	);

	return {
		...actions,
		...useLifecycleActions(send, buffers),
		onOutput,
	};
}
