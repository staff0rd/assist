import { type RefObject, useMemo } from "react";
import {
	cancelTransferAction,
	createRunAction,
	inputAction,
	interruptSessionAction,
	resizeAction,
	setAutoAdvanceAction,
	setAutoApproveAction,
	setStarredAction,
	stopSessionAction,
	transferSessionAction,
} from "../resumeSessionAction";
import { prDecisionAction } from "./useSessionActions/prDecisionAction";
import { useLaunchActions } from "./useSessionActions/useLaunchActions";
import { useLifecycleActions } from "./useSessionActions/useLifecycleActions";
import { outputAction } from "./useSessionActions/outputAction";
import { dequeueMessageAction } from "../dequeueMessageAction";

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
		interruptSession: useMemo(() => interruptSessionAction(send), [send]),
		dequeueMessage: useMemo(() => dequeueMessageAction(send), [send]),
		startRun: useMemo(() => createRunAction(send), [send]),
		transferSession: useMemo(() => transferSessionAction(send), [send]),
		cancelTransfer: useMemo(() => cancelTransferAction(send), [send]),
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
