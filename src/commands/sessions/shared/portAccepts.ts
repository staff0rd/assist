import { connect } from "node:net";

export function portAccepts(port: number, timeoutMs = 1_000): Promise<boolean> {
	return new Promise((resolve) => {
		const socket = connect({ host: "127.0.0.1", port });
		const settle = (ok: boolean) => {
			socket.destroy();
			resolve(ok);
		};
		socket.setTimeout(timeoutMs, () => settle(false));
		socket.once("connect", () => settle(true));
		socket.once("error", () => settle(false));
	});
}
