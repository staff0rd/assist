import { useMemo } from "react";
import {
	createAssistSessionAction,
	createDesignSessionAction,
	createPiSessionAction,
	createSessionAction,
	resumeSessionAction,
} from "./createSessionAction";

type SendFn = (msg: object) => void;

export function useLaunchActions(send: SendFn) {
	return {
		createSession: useMemo(() => createSessionAction(send), [send]),
		createDesignSession: useMemo(() => createDesignSessionAction(send), [send]),
		createPiSession: useMemo(() => createPiSessionAction(send), [send]),
		createAssistSession: useMemo(() => createAssistSessionAction(send), [send]),
		resumeSession: useMemo(() => resumeSessionAction(send), [send]),
	};
}
