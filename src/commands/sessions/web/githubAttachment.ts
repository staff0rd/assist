import { execFile } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import { respondJson } from "../../../shared/web";
import { ghFailure } from "../../../shared/ghFailure";
import {
	isAttachmentAssetId,
	signedAttachmentUrl,
} from "./signedAttachmentUrl";

const execFileAsync = promisify(execFile);

const REPO = /^[\w.-]+\/[\w.-]+$/;
const PR = /^\d+$/;
const CACHE_TTL_MS = 60_000;
const bodyHtmlCache = new Map<string, { html: string; expires: number }>();

async function prBodyHtml(repo: string, pr: string): Promise<string> {
	const key = `${repo}#${pr}`;
	const now = Date.now();
	const cached = bodyHtmlCache.get(key);
	if (cached && cached.expires > now) return cached.html;
	const { stdout } = await execFileAsync(
		"gh",
		[
			"api",
			"-H",
			"Accept: application/vnd.github.html+json",
			`repos/${repo}/issues/${pr}`,
			"--jq",
			'.body_html // ""',
		],
		{ encoding: "utf8", windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
	);
	bodyHtmlCache.set(key, { html: stdout, expires: now + CACHE_TTL_MS });
	return stdout;
}

export async function githubAttachment(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const repo = params.get("repo") ?? "";
	const pr = params.get("pr") ?? "";
	const asset = params.get("asset") ?? "";
	if (!REPO.test(repo) || !PR.test(pr) || !isAttachmentAssetId(asset)) {
		respondJson(res, 400, { error: "Invalid repo, pr or asset" });
		return;
	}
	try {
		const signed = signedAttachmentUrl(await prBodyHtml(repo, pr), asset);
		res.writeHead(302, {
			Location: signed ?? `https://github.com/user-attachments/assets/${asset}`,
			"Cache-Control": "no-store",
		});
		res.end();
	} catch (error) {
		respondJson(res, 502, { error: ghFailure(error) });
	}
}
