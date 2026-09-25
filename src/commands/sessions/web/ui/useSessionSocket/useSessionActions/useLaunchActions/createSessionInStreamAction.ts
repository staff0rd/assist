type SendFn = (msg: object) => void;

export function createSessionInStreamAction(send: SendFn) {
	return (joinSessionId: string, prompt: string, cwd?: string) =>
		send({
			type: "create",
			prompt: prompt || undefined,
			cwd,
			joinSessionId,
			auto: true,
		});
}
