import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { newSessionModeOrder } from "../../newSessionModes";
import { HarnessMenu } from "./NewSessionSelectors/HarnessMenu";
import { modeOptionLabel } from "./NewSessionSelectors/modeOptionLabel";
import { useHarnessMenu } from "./NewSessionSelectors/useHarnessMenu";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";
import type { useDraftFocus } from "../useDraftFocus";
import type { NewSessionDraft } from "../../useNewSessionDraft";

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
	const menu = useHarnessMenu(draft, harnesses, focus);

	return (
		<>
			<SegmentedRadioGroup
				label="Mode"
				options={newSessionModeOrder}
				value={draft.mode}
				onChange={menu.changeMode}
				optionLabel={modeOptionLabel(
					harnesses.length > 1 ? harness : undefined,
					menu.labelledMode,
				)}
				groupRef={focus.modeRef}
				autoFocus={focus.autoFocus === "mode"}
				onTrack={focus.trackMode}
				onToggleRow={menu.onToggleRow}
			/>
			<HarnessMenu
				anchor={menu.anchor}
				harness={harness}
				harnesses={harnesses}
				onPick={draft.setHarness}
				onClose={menu.close}
			/>
		</>
	);
}
