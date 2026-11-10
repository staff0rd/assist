import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { newSessionModeOrder } from "../../newSessionModes";
import { HarnessMenu } from "./NewSessionSelectors/HarnessMenu";
import { modeOptionLabel } from "./NewSessionSelectors/modeOptionLabel";
import { modeSuffix } from "./NewSessionSelectors/modeSuffix";
import { useHarnessMenu } from "./NewSessionSelectors/useHarnessMenu";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";
import type { useDraftFocus } from "../useDraftFocus";
import type { NewSessionDraft } from "../../useNewSessionDraft";
import type { SessionModel } from "../../sessionModel";

export function NewSessionSelectors({
	draft,
	harness,
	harnesses,
	model,
	focus,
}: {
	draft: NewSessionDraft;
	harness: HarnessKind;
	harnesses: HarnessKind[];
	model?: SessionModel;
	focus: ReturnType<typeof useDraftFocus>;
}) {
	const menu = useHarnessMenu(draft, harnesses, focus, !!model);

	return (
		<>
			<SegmentedRadioGroup
				label="Mode"
				options={newSessionModeOrder}
				value={draft.mode}
				onChange={menu.changeMode}
				optionLabel={modeOptionLabel(
					modeSuffix(harness, harnesses.length > 1, model),
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
				model={model}
				onPick={draft.setHarness}
				onClose={menu.close}
			/>
		</>
	);
}
