import type { InstanceConfig } from "./InstanceConfig";

export function instanceEntryUrl(
	entry: InstanceConfig["entry"],
	ports: Record<string, number>,
): string {
	const port = ports[entry.service];
	if (port === undefined)
		throw new Error(
			`review.instance.entry.service \`${entry.service}\` needs a port in review.instance.services (assist config set review.instance.services.${entry.service}.port <port>)`,
		);
	const path = entry.path.startsWith("/") ? entry.path : `/${entry.path}`;
	return `http://localhost:${port}${path}`;
}
