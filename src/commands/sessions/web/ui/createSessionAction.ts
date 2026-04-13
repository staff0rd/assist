type SendFn = (msg: object) => void;
type OutputHandler = (data: string) => void;

export function createSessionAction(send: SendFn) {
	return (prompt: string) =>
		send({ type: "create", prompt: prompt || undefined });
}

export function resumeSessionAction(send: SendFn) {
	return (sessionId: string, cwd: string, name?: string) =>
		send({ type: "resume", sessionId, cwd, name });
}

export function dismissSessionAction(
	send: SendFn,
	buffers: Map<string, string>,
	handlers: Map<string, OutputHandler>,
) {
	return (id: string) => {
		send({ type: "dismiss", sessionId: id });
		buffers.delete(id);
		handlers.delete(id);
	};
}

export function inputAction(send: SendFn) {
	return (sessionId: string, data: string) =>
		send({ type: "input", sessionId, data });
}

export function resizeAction(send: SendFn) {
	return (sessionId: string, cols: number, rows: number) =>
		send({ type: "resize", sessionId, cols, rows });
}

export function outputAction(
	buffers: Map<string, string>,
	handlers: Map<string, OutputHandler>,
) {
	return (sessionId: string, handler: OutputHandler): (() => void) => {
		const buf = buffers.get(sessionId);
		if (buf) handler(buf);
		handlers.set(sessionId, handler);
		return () => handlers.delete(sessionId);
	};
}
