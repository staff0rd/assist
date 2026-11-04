import type { ServerRunMeta } from "./serverRunMeta";

export function serverSlotLabel(meta: ServerRunMeta): string {
	const slot = `${meta.origin ?? "?"} (${meta.group})`;
	return meta.port === undefined ? slot : `${slot} port ${meta.port}`;
}
