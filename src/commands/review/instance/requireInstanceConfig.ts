import { loadConfig } from "../../../shared/loadConfig";
import { exitWithError } from "./exitWithError";
import type { InstanceConfig } from "./InstanceConfig";

export function requireInstanceConfig(): InstanceConfig {
	const config = loadConfig().review?.instance;
	const composeFile = config?.composeFile;
	if (!config || !composeFile)
		exitWithError(
			"review.instance.composeFile is not set; point it at a compose file with `assist config set review.instance.composeFile <file>` (see `assist review instance --help`)",
		);
	const service = config.entry.service;
	if (!service)
		exitWithError(
			"review.instance.entry.service is not set; name the service the instance URL opens with `assist config set review.instance.entry.service <service>`",
		);
	return { ...config, composeFile, entry: { ...config.entry, service } };
}
