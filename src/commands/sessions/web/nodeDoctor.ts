import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { firstBrokenHop } from "../nodes/firstBrokenHop";

export async function nodeDoctor(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const link = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"link",
	);
	if (!link) {
		respondJson(res, 400, { error: "Missing link" });
		return;
	}
	respondJson(res, 200, { hop: (await firstBrokenHop(link)) ?? null });
}
