import { findFreePort } from "../../../shared/findFreePort";
import type { InstanceServices } from "./InstanceConfig";

export async function allocateServicePorts(
	services: InstanceServices,
	nextPort: () => Promise<number> = findFreePort,
): Promise<Record<string, number>> {
	const ports: Record<string, number> = {};
	const taken = new Set<number>();
	for (const [service, { port }] of Object.entries(services)) {
		if (port === undefined) continue;
		let candidate = await nextPort();
		while (taken.has(candidate)) candidate = await nextPort();
		taken.add(candidate);
		ports[service] = candidate;
	}
	return ports;
}
