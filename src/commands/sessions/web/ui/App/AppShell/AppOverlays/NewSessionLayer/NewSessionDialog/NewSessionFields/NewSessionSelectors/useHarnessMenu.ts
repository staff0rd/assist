import { useState } from "react";
import type { HarnessKind } from "../../../../../../../../../../../shared/harnesses";
import { checkedRadio } from "../../checkedRadio";
import {
	harnessFeatureFor,
	type NewSessionMode,
} from "../../../newSessionModes";
import type { useDraftFocus } from "../../useDraftFocus";
import type { NewSessionDraft } from "../../../useNewSessionDraft";

export function useHarnessMenu(
	draft: NewSessionDraft,
	harnesses: HarnessKind[],
	focus: ReturnType<typeof useDraftFocus>,
	pickModel: boolean,
) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const pickable = harnessFeatureFor(draft.mode) !== undefined;
	const pickHarness = pickable && (harnesses.length > 1 || pickModel);
	const open = () => setAnchor(checkedRadio(focus.modeRef.current) ?? null);
	return {
		anchor,
		close: () => setAnchor(null),
		labelledMode: pickable ? draft.mode : "prompt",
		onToggleRow: pickHarness ? open : undefined,
		changeMode: (mode: string) => {
			if (pickHarness && mode === draft.mode) open();
			else draft.setMode(mode as NewSessionMode);
		},
	};
}
