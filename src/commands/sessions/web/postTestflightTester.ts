import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { addTesterOutcome } from "../../testflight/addTesterOutcome";
import { readTestflightConfig } from "../../testflight/readTestflightConfig";
import { parseAddTesterRequest } from "./parseAddTesterRequest";

export async function postTestflightTester(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const parsed = await parseAddTesterRequest(req);
	if (!parsed.ok) {
		respondJson(res, 400, { error: parsed.error });
		return;
	}
	try {
		const config = readTestflightConfig(loadConfig());
		const outcome = await addTesterOutcome(config, parsed.email, {
			internal: parsed.internal,
		});
		respondJson(res, 200, outcome);
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to add tester",
		});
	}
}
