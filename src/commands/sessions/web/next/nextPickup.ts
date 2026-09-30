import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { readJsonBody } from "../readJsonBody";
import { ghErrorText } from "./ghErrorText";
import { nextScope } from "./nextScope";
import { type PickupTarget, pickUpItem } from "./pickUpItem";

function parseTarget(body: unknown): PickupTarget | null {
	const { repo, number, itemId } = (body ?? {}) as Record<string, unknown>;
	if (typeof repo !== "string" || !repo.includes("/")) return null;
	if (typeof number !== "number" || !Number.isInteger(number)) return null;
	if (typeof itemId !== "string" || !itemId) return null;
	return { repo, number, itemId };
}

export async function nextPickup(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	let target: PickupTarget | null;
	try {
		target = parseTarget(await readJsonBody(req));
	} catch {
		respondJson(res, 400, { error: "Invalid JSON body" });
		return;
	}
	if (!target) {
		respondJson(res, 400, { error: "Missing repo, number or itemId" });
		return;
	}
	const { project } = nextScope(cwd);
	if (!project) {
		respondJson(res, 400, { error: "next.project is not set for this repo" });
		return;
	}
	try {
		pickUpItem(project, target);
		respondJson(res, 200, { ok: true });
	} catch (error) {
		respondJson(res, 500, { error: ghErrorText(error) });
	}
}
