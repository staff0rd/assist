import type {
	BrowserLinkMessage,
	BrowserRelayReply,
	BrowserReply,
	BrowserRequest,
} from "../../../extension/browserLink/types";
import { createLinkState, type LinkStateOptions } from "./createLinkState";
import { createPendingReplies } from "./createPendingReplies";

export type LinkSocket = {
	send: (data: string) => void;
	on(event: "message", listener: (data: unknown) => void): unknown;
	on(event: "close", listener: () => void): unknown;
};

function parseLinkMessage(raw: unknown): BrowserLinkMessage | undefined {
	try {
		return JSON.parse(String(raw)) as BrowserLinkMessage;
	} catch {
		return undefined;
	}
}

export function createBrowserLink(options: LinkStateOptions = {}) {
	const state = createLinkState<LinkSocket>(options);
	const replies = createPendingReplies<LinkSocket>();

	function onMessage(ws: LinkSocket, raw: unknown): void {
		const message = parseLinkMessage(raw);
		if (message?.type === "hello") {
			console.log(`browser link: extension v${message.version} connected`);
			state.open(ws, message.version);
		} else if (message?.type === "response") {
			const { type: _type, id, ...reply } = message;
			replies.settle(id, reply as BrowserReply);
		}
	}

	return {
		attach(ws: LinkSocket): void {
			ws.on("message", (data) => onMessage(ws, data));
			ws.on("close", () => {
				console.log("browser link: socket closed");
				state.close(ws);
				replies.dropSocket(ws);
			});
		},

		connectedVersion: (): string | undefined => state.version(),

		async request(
			request: BrowserRequest,
			timeoutMs: number,
		): Promise<BrowserRelayReply> {
			const current = await state.connected();
			const reply = await replies.send(current.ws, timeoutMs, (id) =>
				current.ws.send(JSON.stringify({ ...request, type: "request", id })),
			);
			return { ...reply, version: current.version };
		},
	};
}
