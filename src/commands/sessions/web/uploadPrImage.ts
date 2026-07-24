import { rm } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import {
	GH_IMAGE_INSTALL_COMMAND,
	GhImageUnavailableError,
	runGhImage,
} from "./runGhImage";
import { readRequestBuffer } from "./readRequestBuffer";
import { writeTempImage } from "./writeTempImage";

const MAX_BYTES = 25 * 1024 * 1024;

export async function uploadPrImage(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;

	const url = new URL(req.url ?? "/", "http://localhost");
	const name = url.searchParams.get("name") ?? "";
	const contentType = req.headers["content-type"] ?? "";

	const body = await readRequestBuffer(req, MAX_BYTES);
	if (!body) {
		respondJson(res, 413, { error: "Image too large (max 25MB)." });
		return;
	}
	if (body.length === 0) {
		respondJson(res, 400, { error: "Empty upload." });
		return;
	}

	const { dir, filePath } = await writeTempImage(name, contentType, body);
	try {
		const markdown = await runGhImage(filePath, cwd);
		respondJson(res, 200, { markdown });
	} catch (error) {
		if (error instanceof GhImageUnavailableError) {
			respondJson(res, 501, {
				error: error.message,
				command: GH_IMAGE_INSTALL_COMMAND,
			});
		} else {
			respondJson(res, 500, {
				error: error instanceof Error ? error.message : "Upload failed",
			});
		}
	} finally {
		await rm(dir, { recursive: true, force: true }).catch(() => {});
	}
}
