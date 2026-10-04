import type { PreviewAttachment } from "../../../../../../../shared/PreviewAttachment";
import {
	clearPersisted,
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../../loadPersisted";

type PersistedScreenshot = PreviewAttachment & { contentType: string };

const PREFIX = "assist:preview-screenshots:";

const key = (scope: string) => `${PREFIX}${scope}`;

export function loadPersistedScreenshots(
	scope: string | undefined,
): PersistedScreenshot[] {
	if (!scope) return [];
	prunePersisted(PREFIX);
	return loadPersisted<PersistedScreenshot>(key(scope)).filter(
		(s) => typeof s.path === "string",
	);
}

export function savePersistedScreenshots(
	scope: string | undefined,
	screenshots: PersistedScreenshot[],
): void {
	if (!scope) return;
	savePersisted(
		key(scope),
		screenshots.map(({ path, alt, contentType }) => ({
			path,
			alt,
			contentType,
		})),
	);
}

export function clearPersistedScreenshots(scope: string | undefined): void {
	if (!scope) return;
	clearPersisted(key(scope));
}
