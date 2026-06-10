import { type RefObject, useCallback, useMemo } from "react";
import {
	createAssistSessionAction,
	createSessionAction,
	dismissSessionAction,
	inputAction,
	outputAction,
	resizeAction,
	resumeSessionAction,
	retrySessionAction,
	setAutoRunAction,
} from "./createSessionAction";

type SendFn = (msg: object) => void;
type OutputHandler = (data: string) => void;

export function useSessionActions(
	send: SendFn,
	buffers: RefObject<Map<string, string>>,
	handlers: RefObject<Map<string, OutputHandler>>,
) {
	const actions = {
		createSession: useMemo(() => createSessionAction(send), [send]),
		createAssistSession: useMemo(() => createAssistSessionAction(send), [send]),
		resumeSession: useMemo(() => resumeSessionAction(send), [send]),
		sendInput: useMemo(() => inputAction(send), [send]),
		sendResize: useMemo(() => resizeAction(send), [send]),
		setAutoRun: useMemo(() => setAutoRunAction(send), [send]),
	};

	const onOutput = useMemo(
		() => outputAction(buffers.current, handlers.current),
		[buffers, handlers],
	);

	const retrySession = useCallback(
		(id: string) => {
			retrySessionAction(send, buffers.current)(id);
		},
		[send, buffers],
	);

	const dismissSession = useCallback(
		(id: string) => {
			dismissSessionAction(send, buffers.current, handlers.current)(id);
		},
		[send, buffers, handlers],
	);

	return { ...actions, onOutput, retrySession, dismissSession };
}
