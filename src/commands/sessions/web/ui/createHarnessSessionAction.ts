type SendFn = (msg: object) => void;

function sendCreate(
	send: SendFn,
	extra: object,
	prompt: string,
	cwd?: string,
	node?: string,
	open?: boolean,
) {
	send({
		type: "create",
		prompt: prompt || undefined,
		cwd,
		...extra,
		...(node ? { node } : {}),
		...(open ? { open: true } : {}),
	});
}

export function createDesignSessionAction(send: SendFn) {
	return (prompt: string, cwd?: string, node?: string, open?: boolean) =>
		sendCreate(send, { design: true }, prompt, cwd, node, open);
}

export function createHarnessSessionAction(send: SendFn) {
	return (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
	) => sendCreate(send, { harness, auto: true }, prompt, cwd, node, open);
}
