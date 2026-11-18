import { useState } from "react";
import type { SessionInfo } from "../../types";
import { cardPanePreview } from "./cardPanePreview";

export function useCloseWhenPreviewEnds(
	openSession: SessionInfo | undefined,
	sessionShown: boolean,
	close: () => void,
) {
	const id = openSession?.id;
	const hasPreview = openSession ? !!cardPanePreview(openSession) : false;
	const [seen, setSeen] = useState({ id, hasPreview });
	if (seen.id === id && seen.hasPreview === hasPreview) return;
	setSeen({ id, hasPreview });
	if (seen.id === id && seen.hasPreview && !sessionShown) close();
}
