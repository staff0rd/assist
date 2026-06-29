import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { createCachedGhJson } from "./createCachedGhJson";
import { getCwdParam } from "./getCwdParam";

const getPrNumber = createCachedGhJson<number | null>(
	["pr", "view", "--json", "number"],
	(stdout) => {
		const parsed = JSON.parse(stdout) as { number?: number };
		return typeof parsed.number === "number" ? parsed.number : null;
	},
	null,
);

export async function prStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	respondJson(res, 200, { number: await getPrNumber(cwd) });
}
