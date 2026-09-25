import {
	clearPersisted,
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../../loadPersisted";

type PersistedScreenshot = { markdown: string; contentType: string };

const PREFIX = "assist:preview-screenshots:";

const key = (scope: string) => `${PREFIX}${scope}`;

export function loadPersistedScreenshots(
	scope: string | undefined,
): PersistedScreenshot[] {
	if (!scope) return [];
	prunePersisted(PREFIX);
	return loadPersisted<PersistedScreenshot>(key(scope));
}

export function savePersistedScreenshots(
	scope: string | undefined,
	screenshots: PersistedScreenshot[],
): void {
	if (!scope) return;
	savePersisted(
		key(scope),
		screenshots.map(({ markdown, contentType }) => ({ markdown, contentType })),
	);
}

export function clearPersistedScreenshots(scope: string | undefined): void {
	if (!scope) return;
	clearPersisted(key(scope));
}
