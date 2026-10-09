import type { PreviewAttachment } from "../../../../../../shared/PreviewAttachment";
import {
	clearPersisted,
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../loadPersisted";

export type PersistedScreenshot = PreviewAttachment & {
	contentType: string;
	seeded?: boolean;
};

const PREFIX = "assist:preview-screenshots:";

const key = (scope: string) => `${PREFIX}${scope}`;

export const seededKey = (scope: string) => `${PREFIX}seeded:${scope}`;

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
		screenshots.map(({ path, alt, group, contentType, seeded }) => ({
			path,
			alt,
			group,
			contentType,
			seeded,
		})),
	);
}

export function clearPersistedScreenshots(scope: string | undefined): void {
	if (!scope) return;
	clearPersisted(key(scope));
	clearPersisted(seededKey(scope));
}
