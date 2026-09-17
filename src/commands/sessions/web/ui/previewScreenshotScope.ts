import type { PreviewKind } from "../../shared/SessionInfoBase";

export function previewScreenshotScope(
	sessionId: string | undefined,
	kind: PreviewKind | undefined,
): string | undefined {
	return sessionId ? `${sessionId}:${kind ?? "pr"}` : undefined;
}
