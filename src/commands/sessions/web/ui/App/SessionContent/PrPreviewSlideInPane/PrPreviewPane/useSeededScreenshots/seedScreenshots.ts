import type { PreviewAttachment } from "../../../../../../../shared/PreviewAttachment";
import { attachmentMimeTypes } from "../../../../../../attachmentMimeTypes";
import { loadPersisted, savePersisted } from "../../../../loadPersisted";
import {
	loadPersistedScreenshots,
	type PersistedScreenshot,
	savePersistedScreenshots,
	seededKey,
} from "../loadPersistedScreenshots";

function contentTypeFor(path: string): string {
	const ext = path.split(".").pop()?.toLowerCase();
	const match = Object.entries(attachmentMimeTypes).find(([, e]) => e === ext);
	return match?.[0] ?? "application/octet-stream";
}

function toSeeded(seeds: PreviewAttachment[]): PersistedScreenshot[] {
	return seeds.map((s) => ({
		...s,
		contentType: contentTypeFor(s.path),
		seeded: true,
	}));
}

export function seedScreenshots(
	scope: string | undefined,
	requestId: string,
	seeds: PreviewAttachment[],
): PersistedScreenshot[] {
	if (!scope) return toSeeded(seeds);
	const persisted = loadPersistedScreenshots(scope);
	if (loadPersisted<string>(seededKey(scope))[0] === requestId)
		return persisted;
	const next = [...toSeeded(seeds), ...persisted.filter((s) => !s.seeded)];
	savePersistedScreenshots(scope, next);
	savePersisted(seededKey(scope), [requestId]);
	return next;
}
