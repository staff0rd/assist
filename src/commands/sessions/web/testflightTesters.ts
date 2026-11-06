import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { listTesters } from "../../testflight/listTesters";
import { readTestflightConfig } from "../../testflight/readTestflightConfig";

export async function testflightTesters(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	try {
		const config = readTestflightConfig(loadConfig());
		respondJson(res, 200, await listTesters(config));
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to list testers",
		});
	}
}
