type SendFn = (msg: object) => void;

export function stopShellCommandAction(send: SendFn) {
	return (id: string, shellId: string) =>
		send({ type: "sdk-shell-stop", sessionId: id, shellId });
}
