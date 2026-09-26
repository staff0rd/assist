import type { IncomingMessage, ServerResponse } from "node:http";
import { isKnownConfigKey } from "../../config/isKnownConfigKey";
import { applyScopedConfigUnset } from "./applyScopedConfigUnset";
import { handleConfigWrite } from "./handleConfigWrite";

export function unsetConfig(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return handleConfigWrite(req, res, (request) => {
		if (!isKnownConfigKey(request.key))
			return { ok: false, errors: [`Unknown config key "${request.key}"`] };

		return applyScopedConfigUnset(request.key, request.cwd, request.scope);
	});
}
