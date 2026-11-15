type SendFn = (msg: object) => void;

export function discardShellResultAction(send: SendFn) {
	return (id: string, shellId: string) =>
		send({ type: "sdk-shell-discard", sessionId: id, shellId });
}
