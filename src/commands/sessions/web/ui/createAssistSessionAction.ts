import type { AssistLaunchMeta } from "./resumeSessionAction";

type SendFn = (msg: object) => void;

export function createAssistSessionAction(send: SendFn) {
	return (assistArgs: string[], cwd?: string, meta?: AssistLaunchMeta) =>
		send({ type: "create-assist", assistArgs, cwd, ...meta });
}
