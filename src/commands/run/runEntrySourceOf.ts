import { isRunLink } from "../../shared/isRunLink";
import type { RawConfigLayers } from "../../shared/loadRawConfigLayers";
import type { RunEntry } from "../../shared/types";
import type { RunEntrySource } from "./RunEntrySource";

function layerHas(layer: Record<string, unknown>, entry: RunEntry): boolean {
	const run = layer.run;
	if (!Array.isArray(run)) return false;
	return run.some((raw: Record<string, unknown>) =>
		isRunLink(entry)
			? raw.link === entry.link && raw.prefix === entry.prefix
			: raw.name === entry.name,
	);
}

export function runEntrySourceOf(
	entry: RunEntry,
	layers: RawConfigLayers,
): RunEntrySource {
	if (layerHas(layers.project, entry))
		return { kind: "project", path: layers.projectPath };
	if (layerHas(layers.repo, entry))
		return { kind: "repo", from: layers.repoSource ?? "db" };
	if (layerHas(layers.user, entry) && !layerHas(layers.global, entry))
		return { kind: "user" };
	return { kind: "global", path: layers.globalPath };
}
