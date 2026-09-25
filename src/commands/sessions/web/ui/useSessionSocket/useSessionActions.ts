import { type RefObject, useMemo } from "react";
import {
	createRunAction,
	inputAction,
	outputAction,
	resizeAction,
	setAutoAdvanceAction,
	setAutoRunAction,
	setStarredAction,
	stopSessionAction,
} from "../createSessionAction";
import { prDecisionAction } from "./useSessionActions/prDecisionAction";
import { useLaunchActions } from "./useSessionActions/useLaunchActions";
import { useLifecycleActions } from "./useSessionActions/useLifecycleActions";

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
		setAutoRun: useMemo(() => setAutoRunAction(send), [send]),
		setAutoAdvance: useMemo(() => setAutoAdvanceAction(send), [send]),
		setStarred: useMemo(() => setStarredAction(send), [send]),
		stopSession: useMemo(() => stopSessionAction(send), [send]),
		startRun: useMemo(() => createRunAction(send), [send]),
	};

	const onOutput = useMemo(
		() => outputAction(buffers.current, handlers.current),
		[buffers, handlers],
	);

	return {
		...actions,
		...useLifecycleActions(send, buffers),
		onOutput,
	};
}
