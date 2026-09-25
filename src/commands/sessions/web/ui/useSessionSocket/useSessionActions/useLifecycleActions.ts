import { type RefObject, useCallback } from "react";
import {
	discardSessionAction,
	dismissSessionAction,
	restartSessionAction,
	retrySessionAction,
} from "../../createSessionAction";

type SendFn = (msg: object) => void;

export function useLifecycleActions(
	send: SendFn,
	buffers: RefObject<Map<string, string>>,
) {
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
			dismissSessionAction(send, buffers.current)(id);
		},
		[send, buffers],
	);

	const discardSession = useCallback(
		(id: string) => {
			discardSessionAction(send, buffers.current)(id);
		},
		[send, buffers],
	);

	return { retrySession, restartSession, dismissSession, discardSession };
}
