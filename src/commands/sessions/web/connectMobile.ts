import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { connectMobileTarget } from "./connectMobileTarget";

export async function connectMobile(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	respondJson(res, 200, await connectMobileTarget(req.socket.localPort ?? 0));
}
