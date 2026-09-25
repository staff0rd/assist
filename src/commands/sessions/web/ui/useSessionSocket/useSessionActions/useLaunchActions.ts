import { useMemo } from "react";
import {
	createAssistSessionAction,
	createDesignSessionAction,
	createHarnessSessionAction,
	createSessionAction,
	resumeSessionAction,
} from "../../createSessionAction";
import { createSessionInStreamAction } from "./useLaunchActions/createSessionInStreamAction";

type SendFn = (msg: object) => void;

export function useLaunchActions(send: SendFn) {
	return {
		createSession: useMemo(() => createSessionAction(send), [send]),
		createSessionInStream: useMemo(
			() => createSessionInStreamAction(send),
			[send],
		),
		createDesignSession: useMemo(() => createDesignSessionAction(send), [send]),
		createHarnessSession: useMemo(
			() => createHarnessSessionAction(send),
			[send],
		),
		createAssistSession: useMemo(() => createAssistSessionAction(send), [send]),
		resumeSession: useMemo(() => resumeSessionAction(send), [send]),
	};
}
