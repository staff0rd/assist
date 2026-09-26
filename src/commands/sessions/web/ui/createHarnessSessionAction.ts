type SendFn = (msg: object) => void;

export function sendCreate(
	send: SendFn,
	extra: object,
	prompt: string,
	cwd?: string,
	node?: string,
) {
	send({
		type: "create",
		prompt: prompt || undefined,
		cwd,
		...extra,
		...(node ? { node } : {}),
	});
}

export function createDesignSessionAction(send: SendFn) {
	return (prompt: string, cwd?: string, node?: string) =>
		sendCreate(send, { design: true }, prompt, cwd, node);
}

export function createHarnessSessionAction(send: SendFn) {
	return (harness: string, prompt: string, cwd?: string, node?: string) =>
		sendCreate(send, { harness }, prompt, cwd, node);
}
