type SendFn = (msg: object) => void;

function sendCreate(
	send: SendFn,
	extra: object,
	prompt: string,
	cwd?: string,
	node?: string,
	open?: boolean,
	model?: string,
) {
	send({
		type: "create",
		prompt: prompt || undefined,
		cwd,
		...extra,
		...(model ? { model } : {}),
		...(node ? { node } : {}),
		...(open ? { open: true } : {}),
	});
}

export function createDesignSessionAction(send: SendFn) {
	return (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
		model?: string,
	) =>
		sendCreate(send, { design: true, harness }, prompt, cwd, node, open, model);
}

export function createHarnessSessionAction(send: SendFn) {
	return (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
		model?: string,
	) =>
		sendCreate(send, { harness, auto: true }, prompt, cwd, node, open, model);
}
