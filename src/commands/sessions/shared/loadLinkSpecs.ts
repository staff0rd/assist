import { loadConfig } from "../../../shared/loadConfig";
import type { LinkSpec } from "../daemon/links/LinkStatus";

export function loadLinkSpecs(): LinkSpec[] {
	return loadConfig().sessions?.links ?? [];
}

export function findLinkSpec(name: string): LinkSpec | undefined {
	return loadLinkSpecs().find((spec) => spec.name === name);
}
