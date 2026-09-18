import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { ghAuthToken } from "./ghAuthToken";
import { isUserAttachmentUrl } from "./isUserAttachmentUrl";

export async function previewImage(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const target = url.searchParams.get("url") ?? "";
	if (!isUserAttachmentUrl(target)) {
		respondJson(res, 400, { error: "Not a GitHub attachment url." });
		return;
	}

	let token: string;
	try {
		token = await ghAuthToken(url.searchParams.get("cwd") ?? undefined);
	} catch {
		respondJson(res, 502, { error: "Could not read a GitHub token." });
		return;
	}

	let location: string | null;
	try {
		const upstream = await fetch(target, {
			headers: { Authorization: `Bearer ${token}` },
			redirect: "manual",
		});
		location = upstream.headers.get("location");
	} catch {
		respondJson(res, 502, { error: "Could not reach GitHub." });
		return;
	}

	if (!location) {
		respondJson(res, 404, { error: "Attachment is no longer available." });
		return;
	}
	res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
	res.end();
}
