import { execFile } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import { respondJson } from "../../../shared/web";
import { createCachedGhJson } from "./createCachedGhJson";
import { getCwdParam } from "./getCwdParam";
import type { PrSummary } from "./prList";
import { windowsCwdToWslPath } from "./windowsCwdToWslPath";

const execFileAsync = promisify(execFile);

type GhPr = {
	number?: number;
	title?: string;
	author?: { login?: string; name?: string };
	createdAt?: string;
	url?: string;
};

function toPrSummary(parsed: GhPr): PrSummary | null {
	if (typeof parsed.number !== "number") return null;
	return {
		number: parsed.number,
		title: parsed.title ?? "",
		author: parsed.author?.name || parsed.author?.login || "unknown",
		createdAt: parsed.createdAt ?? "",
		url: parsed.url ?? "",
	};
}

const prFields = "number,title,author,createdAt,url";

const getPrByNumber = createCachedGhJson<PrSummary | null>(
	["pr", "view", "--json", prFields],
	(stdout) => toPrSummary(JSON.parse(stdout) as GhPr),
	null,
	{ cacheFallback: false },
);

const getOpenPrForBranch = createCachedGhJson<PrSummary | null>(
	["pr", "list", "--state", "open", "--json", prFields],
	(stdout) => {
		const parsed = JSON.parse(stdout) as GhPr[];
		if (!Array.isArray(parsed) || parsed.length === 0) return null;
		return toPrSummary(parsed[0]);
	},
	null,
	{ cacheFallback: false },
);

async function getCurrentBranch(cwd: string): Promise<string | undefined> {
	try {
		const { stdout } = await execFileAsync(
			"git",
			["rev-parse", "--abbrev-ref", "HEAD"],
			{ encoding: "utf8", cwd: windowsCwdToWslPath(cwd) },
		);
		const branch = stdout.trim();
		return branch && branch !== "HEAD" ? branch : undefined;
	} catch {
		return undefined;
	}
}

function getNumberParam(req: IncomingMessage): number | undefined {
	const raw = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"number",
	);
	if (!raw) return undefined;
	const parsed = Number(raw);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function prStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const number = getNumberParam(req);
	if (number !== undefined) {
		respondJson(res, 200, { pr: await getPrByNumber(cwd, [String(number)]) });
		return;
	}
	const branch = await getCurrentBranch(cwd);
	const pr = branch ? await getOpenPrForBranch(cwd, ["--head", branch]) : null;
	respondJson(res, 200, { pr });
}
