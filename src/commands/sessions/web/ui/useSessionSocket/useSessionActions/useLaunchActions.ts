import { useMemo } from "react";
import {
	createDesignSessionAction,
	createHarnessSessionAction,
} from "../../createHarnessSessionAction";
import { resumeSessionAction } from "../../resumeSessionAction";
import { createSessionInStreamAction } from "./useLaunchActions/createSessionInStreamAction";
import { createAssistSessionAction } from "../../createAssistSessionAction";

type SendFn = (msg: object) => void;

export function useLaunchActions(send: SendFn) {
	return {
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
