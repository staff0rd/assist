type SendFn = (msg: object) => void;

export function runShellCommandAction(send: SendFn) {
	return (id: string, command: string) =>
		send({ type: "sdk-shell", sessionId: id, command });
}
