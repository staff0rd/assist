import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { allowExtensionOrigin } from "./fromGithub/allowExtensionOrigin";
import { harnessFeatureResolutions } from "./harnessFeatureResolutions";

export function harnessCapabilities(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	allowExtensionOrigin(req, res);
	const config = loadConfig().harness;
	const { detected, features } = harnessFeatureResolutions(config);
	respondJson(res, 200, {
		exposeCodexActions: detected.codex,
		exposePiActions: detected.pi,
		engine: config.engine,
		runHarness: config.defaults?.run?.harness ?? config.engine,
		features,
	});
}
