type SendFn = (msg: object) => void;

export function startOverSessionAction(
	send: SendFn,
	buffers: Map<string, string>,
) {
	return (id: string) => {
		buffers.delete(id);
		send({ type: "start-over", sessionId: id });
	};
}
