import type { InstanceCheckout } from "./checkouts/InstanceCheckout";
import { serviceEnvName } from "./serviceEnvName";

export function buildInstanceEnv(
	checkouts: InstanceCheckout[],
	ports: Record<string, number>,
): Record<string, string> {
	const env: Record<string, string> = {};
	for (const checkout of checkouts)
		for (const service of checkout.services)
			env[`ASSIST_SRC_${serviceEnvName(service)}`] = checkout.dir;
	for (const [service, port] of Object.entries(ports))
		env[`ASSIST_PORT_${serviceEnvName(service)}`] = String(port);
	return env;
}
