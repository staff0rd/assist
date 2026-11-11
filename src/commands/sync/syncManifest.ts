import { loadJson, saveJson } from "../../shared/loadJson";

const MANIFEST = "sync-manifest.json";

export const syncManifest = {
	load: (): string[] => loadJson<{ files?: string[] }>(MANIFEST).files ?? [],
	save: (files: Iterable<string>): void =>
		saveJson(MANIFEST, { files: [...files].sort() }),
};
