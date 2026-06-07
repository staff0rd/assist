type SendFn = (msg: object) => void;
type OutputHandler = (data: string) => void;

export function createSessionAction(send: SendFn) {
	return (prompt: string, cwd?: string) =>
		send({ type: "create", prompt: prompt || undefined, cwd });
}

export function createRunSessionAction(send: SendFn) {
	return (runName: string, runArgs: string[], cwd?: string) =>
		send({ type: "create-run", runName, runArgs, cwd });
}

export function createAssistSessionAction(send: SendFn) {
	return (assistArgs: string[], cwd?: string) =>
		send({ type: "create-assist", assistArgs, cwd });
}

export function requestRunConfigsAction(send: SendFn) {
	return (cwd: string) => send({ type: "run-configs", cwd });
}

export function resumeSessionAction(send: SendFn) {
	return (sessionId: string, cwd: string, name?: string) =>
		send({ type: "resume", sessionId, cwd, name });
}

export function retrySessionAction(send: SendFn, buffers: Map<string, string>) {
	return (id: string) => {
		// Keep the output handler registered: the terminal pane stays mounted
		// across a retry, and the daemon's clear broadcast resets it
		buffers.delete(id);
		send({ type: "retry", sessionId: id });
	};
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
