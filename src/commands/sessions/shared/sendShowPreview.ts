import { connectToDaemon } from "../daemon/connectToDaemon";

type ShowRequest = {
	sessionId: string;
	requestId: string;
	title: string;
	body: string;
};

export async function sendShowPreview(request: ShowRequest): Promise<void> {
	const socket = await connectToDaemon();
	await new Promise<void>((resolve, reject) => {
		socket.on("error", reject);
		socket.end(
			`${JSON.stringify({ type: "pr-preview", kind: "show", prNumber: null, ...request })}\n`,
			() => {
				socket.destroy();
				resolve();
			},
		);
	});
}
