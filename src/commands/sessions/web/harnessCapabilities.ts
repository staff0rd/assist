import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { harnessFeatureResolutions } from "./harnessFeatureResolutions";

export function harnessCapabilities(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const config = loadConfig().harness;
	const { detected, features } = harnessFeatureResolutions(config);
	respondJson(res, 200, {
		exposeCodexActions: detected.codex,
		exposePiActions: detected.pi,
		engine: config.engine,
		features,
	});
}
