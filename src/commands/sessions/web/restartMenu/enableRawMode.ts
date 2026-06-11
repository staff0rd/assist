export function enableRawMode(
	stdin: NodeJS.ReadStream,
	onData: (chunk: string) => void,
): () => void {
	const wasRaw = stdin.isRaw;
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding("utf8");
	stdin.on("data", onData);
	return () => {
		stdin.removeListener("data", onData);
		if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false);
		stdin.pause();
	};
}
