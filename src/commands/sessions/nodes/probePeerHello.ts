import { buildHello } from "../daemon/buildHello";
import { connectLinkWebSocket } from "../daemon/links/connectLinkWebSocket";

const HELLO_TIMEOUT_MS = 5_000;

export async function probePeerHello(
	url: string,
): Promise<Record<string, unknown>> {
	let settle: (hello: Record<string, unknown> | Error) => void = () => {};
	const reply = new Promise<Record<string, unknown> | Error>((resolve) => {
		settle = resolve;
	});
	const socket = await connectLinkWebSocket(url, {
		onLine: (line) => {
			try {
				const msg = JSON.parse(line);
				if (msg.type === "hello") settle(msg);
			} catch {}
		},
		onClose: (reason) =>
			settle(new Error(`closed before hello reply (${reason})`)),
	});
	const timer = setTimeout(
		() =>
			settle(new Error(`no hello reply within ${HELLO_TIMEOUT_MS / 1000}s`)),
		HELLO_TIMEOUT_MS,
	);
	socket.send(JSON.stringify(buildHello()));
	const result = await reply;
	clearTimeout(timer);
	socket.close();
	if (result instanceof Error) throw result;
	return result;
}
