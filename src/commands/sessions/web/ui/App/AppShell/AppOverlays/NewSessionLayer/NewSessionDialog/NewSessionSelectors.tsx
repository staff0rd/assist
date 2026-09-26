import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../shared/harnessLabel";
import { type NewSessionMode, newSessionModeOrder } from "./newSessionModes";
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
	return (
		<>
			<SegmentedRadioGroup
				label="Mode"
				options={newSessionModeOrder}
				value={draft.mode}
				onChange={(mode) => draft.setMode(mode as NewSessionMode)}
				groupRef={focus.modeRef}
				autoFocus={focus.autoFocus === "mode"}
				onTrack={focus.trackMode}
			/>
			{draft.mode === "prompt" && harnesses.length > 1 && (
				<SegmentedRadioGroup
					label="Harness"
					options={harnesses}
					value={harness}
					onChange={(choice) => draft.setHarness(choice as HarnessKind)}
					optionLabel={(choice) => harnessLabel(choice as HarnessKind)}
					groupRef={focus.harnessRef}
					autoFocus={focus.autoFocus === "harness"}
					onTrack={focus.trackHarness}
				/>
			)}
		</>
	);
}
