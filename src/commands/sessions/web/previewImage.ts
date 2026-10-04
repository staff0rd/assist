import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { isStagedAttachmentPath } from "../../../shared/isStagedAttachmentPath";
import { respondJson } from "../../../shared/web";
import { attachmentContentType } from "./attachmentContentType";

export async function previewImage(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const path = url.searchParams.get("path") ?? "";
	if (!isStagedAttachmentPath(path)) {
		respondJson(res, 400, { error: "Not a staged attachment." });
		return;
	}

	const info = await stat(path).catch(() => null);
	if (!info?.isFile()) {
		respondJson(res, 404, { error: "Attachment is no longer staged." });
		return;
	}

	res.writeHead(200, {
		"Content-Type": attachmentContentType(path),
		"Content-Length": info.size,
		"Cache-Control": "no-store",
	});
	createReadStream(path).pipe(res);
}
