import type { InstanceServices } from "./InstanceConfig";
import { serviceEnvName } from "./serviceEnvName";

export function buildInstanceEnv(
	services: InstanceServices,
	srcPath: string,
	ports: Record<string, number>,
): Record<string, string> {
	const env: Record<string, string> = {};
	for (const service of Object.keys(services)) {
		const name = serviceEnvName(service);
		env[`ASSIST_SRC_${name}`] = srcPath;
		const port = ports[service];
		if (port !== undefined) env[`ASSIST_PORT_${name}`] = String(port);
	}
	return env;
}
