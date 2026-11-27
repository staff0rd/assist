import { findFreePort } from "../../../shared/findFreePort";
import type { InstanceServices } from "./InstanceConfig";

export async function allocateServicePorts(
	services: InstanceServices,
	nextPort: () => Promise<number> = findFreePort,
): Promise<Record<string, number>> {
	const ports: Record<string, number> = {};
	const taken = new Set<number>();
	for (const [service, { hostPort }] of Object.entries(services))
		if (hostPort !== undefined) {
			ports[service] = hostPort;
			taken.add(hostPort);
		}
	for (const [service, { port, hostPort }] of Object.entries(services)) {
		if (port === undefined || hostPort !== undefined) continue;
		let candidate = await nextPort();
		while (taken.has(candidate)) candidate = await nextPort();
		taken.add(candidate);
		ports[service] = candidate;
	}
	return ports;
}
