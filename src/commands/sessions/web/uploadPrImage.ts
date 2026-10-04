import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { readRequestBuffer } from "./readRequestBuffer";
import { stageAttachment } from "./stageAttachment";
import { uploadSizeLimit } from "./uploadSizeLimit";

export async function uploadPrImage(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const name = url.searchParams.get("name") ?? "";
	const contentType = req.headers["content-type"] ?? "";

	const { maxBytes, tooLargeMessage } = uploadSizeLimit(contentType);
	const body = await readRequestBuffer(req, maxBytes);
	if (!body) {
		respondJson(res, 413, { error: tooLargeMessage });
		return;
	}
	if (body.length === 0) {
		respondJson(res, 400, { error: "Empty upload." });
		return;
	}

	try {
		const { filePath, alt } = await stageAttachment(name, contentType, body);
		respondJson(res, 200, { path: filePath, alt });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Staging failed",
		});
	}
}
