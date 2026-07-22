import type { Socket } from "node:net";

export function readSocketLines(
	socket: Socket,
	onLine: (line: string) => void,
): void {
	let buffer = "";
	socket.on("data", (chunk) => {
		buffer += chunk.toString("utf8");
		let newline = buffer.indexOf("\n");
		while (newline !== -1) {
			onLine(buffer.slice(0, newline));
			buffer = buffer.slice(newline + 1);
			newline = buffer.indexOf("\n");
		}
	});
}
