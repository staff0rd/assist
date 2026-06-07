import { type RefObject, useCallback, useMemo } from "react";
import {
	createAssistSessionAction,
	createRunSessionAction,
	createSessionAction,
	dismissSessionAction,
	inputAction,
	outputAction,
	requestRunConfigsAction,
	resizeAction,
	resumeSessionAction,
	retrySessionAction,
} from "./createSessionAction";

type SendFn = (msg: object) => void;
type OutputHandler = (data: string) => void;

export function useSessionActions(
	send: SendFn,
	buffers: RefObject<Map<string, string>>,
	handlers: RefObject<Map<string, OutputHandler>>,
	setActiveId: (id: string | null) => void,
) {
	const actions = {
		createSession: useMemo(() => createSessionAction(send), [send]),
		createRunSession: useMemo(() => createRunSessionAction(send), [send]),
		createAssistSession: useMemo(() => createAssistSessionAction(send), [send]),
		requestRunConfigs: useMemo(() => requestRunConfigsAction(send), [send]),
		resumeSession: useMemo(() => resumeSessionAction(send), [send]),
		sendInput: useMemo(() => inputAction(send), [send]),
		sendResize: useMemo(() => resizeAction(send), [send]),
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
			setActiveId(null);
		},
		[send, buffers, handlers, setActiveId],
	);

	return { ...actions, onOutput, retrySession, dismissSession };
}
