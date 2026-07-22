import { type RefObject, useCallback, useMemo } from "react";
import {
	createRunAction,
	dismissSessionAction,
	inputAction,
	outputAction,
	prDecisionAction,
	resizeAction,
	restartSessionAction,
	retrySessionAction,
	setAutoAdvanceAction,
	setAutoRunAction,
	setStarredAction,
	stopSessionAction,
} from "./createSessionAction";
import { useLaunchActions } from "./useLaunchActions";

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

	const retrySession = useCallback(
		(id: string, replace?: boolean) => {
			retrySessionAction(send, buffers.current)(id, replace);
		},
		[send, buffers],
	);

	const restartSession = useCallback(
		(id: string) => {
			restartSessionAction(send, buffers.current)(id);
		},
		[send, buffers],
	);

	const dismissSession = useCallback(
		(id: string) => {
			dismissSessionAction(send, buffers.current, handlers.current)(id);
		},
		[send, buffers, handlers],
	);

	return { ...actions, onOutput, retrySession, restartSession, dismissSession };
}
