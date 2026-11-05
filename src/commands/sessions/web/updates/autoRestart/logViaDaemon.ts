import { requestDaemonReply } from "../../../daemon/requestDaemonReply";

const ACK_TIMEOUT_MS = 1_000;

export async function logViaDaemon(message: string): Promise<void> {
	const ack = await requestDaemonReply(
		{ type: "web-log", message },
		"web-logged",
		ACK_TIMEOUT_MS,
	);
	if (!ack) console.log(message);
}
