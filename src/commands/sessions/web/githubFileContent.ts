import type { IncomingMessage, ServerResponse } from "node:http";
import { ghFailure } from "../../../shared/ghFailure";
import { ghRawFileAtSha } from "../../../shared/ghRawFileAtSha";
import { respondJson } from "../../../shared/web";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const REPO = /^[\w.-]+\/[\w.-]+$/;
const SHA = /^[0-9a-f]{7,40}$/i;

function validPath(path: string): boolean {
	return (
		path.length > 0 &&
		!path.startsWith("/") &&
		path.split("/").every((part) => part !== "" && part !== "..")
	);
}

export async function githubFileContent(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const repo = params.get("repo") ?? "";
	const sha = params.get("sha") ?? "";
	const path = params.get("path") ?? "";
	if (!REPO.test(repo) || !SHA.test(sha) || !validPath(path)) {
		respondJson(res, 400, { error: "Invalid repo, sha or path" });
		return;
	}
	try {
		const content = await ghRawFileAtSha(repo, sha, path, MAX_FILE_BYTES);
		respondJson(res, 200, { content });
	} catch (error) {
		respondJson(res, 502, { error: ghFailure(error) });
	}
}
