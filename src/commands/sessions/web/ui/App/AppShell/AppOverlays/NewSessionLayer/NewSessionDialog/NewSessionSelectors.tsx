import Stack from "@mui/material/Stack";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { checkedRadio } from "./checkedRadio";
import { HarnessRow } from "./HarnessRow";
import { type NewSessionMode, newSessionModeOrder } from "./newSessionModes";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";
import type { useDraftFocus } from "./useDraftFocus";
import { useOffsetUnderChecked } from "./useOffsetUnderChecked";
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
	const showHarness = draft.mode === "prompt" && harnesses.length > 1;
	const { containerRef, offset } = useOffsetUnderChecked(
		focus.modeRef,
		draft.mode,
	);
	const focusHarness = () => checkedRadio(focus.harnessRef.current)?.focus();

	return (
		<Stack ref={containerRef} spacing={0.5} sx={{ flexShrink: 0 }}>
			<SegmentedRadioGroup
				label="Mode"
				options={newSessionModeOrder}
				value={draft.mode}
				onChange={(mode) => draft.setMode(mode as NewSessionMode)}
				groupRef={focus.modeRef}
				autoFocus={focus.autoFocus === "mode"}
				onTrack={focus.trackMode}
				onToggleRow={showHarness ? focusHarness : undefined}
			/>
			{showHarness && (
				<HarnessRow
					harness={harness}
					harnesses={harnesses}
					onChange={draft.setHarness}
					offset={offset}
					focus={focus}
				/>
			)}
		</Stack>
	);
}
