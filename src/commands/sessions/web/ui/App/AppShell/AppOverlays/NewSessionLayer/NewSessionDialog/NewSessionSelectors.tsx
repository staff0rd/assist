import { useState } from "react";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { checkedRadio } from "./checkedRadio";
import { type NewSessionMode, newSessionModeOrder } from "./newSessionModes";
import { HarnessMenu } from "./NewSessionSelectors/HarnessMenu";
import { modeOptionLabel } from "./NewSessionSelectors/modeOptionLabel";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";
import type { useDraftFocus } from "./useDraftFocus";
import type { NewSessionDraft } from "../useNewSessionDraft";

export function NewSessionSelectors({
	draft,
	harness,
	harnesses,
	focus,
}: {
	draft: NewSessionDraft;
	harness: HarnessKind;
	harnesses: HarnessKind[];
	focus: ReturnType<typeof useDraftFocus>;
}) {
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const pickHarness = draft.mode === "prompt" && harnesses.length > 1;
	const openMenu = () =>
		setMenuAnchor(checkedRadio(focus.modeRef.current) ?? null);

	const changeMode = (mode: string) => {
		if (pickHarness && mode === "prompt") openMenu();
		else draft.setMode(mode as NewSessionMode);
	};

	return (
		<>
			<SegmentedRadioGroup
				label="Mode"
				options={newSessionModeOrder}
				value={draft.mode}
				onChange={changeMode}
				optionLabel={modeOptionLabel(
					harnesses.length > 1 ? harness : undefined,
				)}
				groupRef={focus.modeRef}
				autoFocus={focus.autoFocus === "mode"}
				onTrack={focus.trackMode}
				onToggleRow={pickHarness ? openMenu : undefined}
			/>
			<HarnessMenu
				anchor={menuAnchor}
				harness={harness}
				harnesses={harnesses}
				onPick={draft.setHarness}
				onClose={() => setMenuAnchor(null)}
			/>
		</>
	);
}
