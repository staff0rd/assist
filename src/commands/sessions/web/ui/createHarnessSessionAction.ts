type SendFn = (msg: object) => void;

type CreateFlags = {
	node?: string;
	open?: boolean;
	model?: string;
	yolo?: boolean;
};

function sendCreate(
	send: SendFn,
	extra: object,
	prompt: string,
	cwd: string | undefined,
	{ node, open, model, yolo }: CreateFlags,
) {
	send({
		type: "create",
		prompt: prompt || undefined,
		cwd,
		...extra,
		...(model ? { model } : {}),
		...(node ? { node } : {}),
		...(open ? { open: true } : {}),
		...(yolo ? { yolo: true } : {}),
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
		yolo?: boolean,
	) =>
		sendCreate(send, { design: true, harness }, prompt, cwd, {
			node,
			open,
			model,
			yolo,
		});
}

export function createHarnessSessionAction(send: SendFn) {
	return (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
		model?: string,
		yolo?: boolean,
	) =>
		sendCreate(send, { harness, auto: true }, prompt, cwd, {
			node,
			open,
			model,
			yolo,
		});
}
