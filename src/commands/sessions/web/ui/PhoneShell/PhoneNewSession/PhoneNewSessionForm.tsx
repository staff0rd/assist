import { NewSessionModeError } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionModeError";
import { newSessionModes } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import { PhoneModeSelector } from "./PhoneModeSelector";
import { PhoneNewSessionPrompt } from "./PhoneNewSessionPrompt";
import { PhoneRepoRow } from "./PhoneRepoRow";
import { PhoneRunOn } from "./PhoneRunOn";
import { PhoneSheetButton } from "../PhoneSheetButton";
import type { PhoneNewSession } from "./usePhoneNewSession";

export function PhoneNewSessionForm({
	form,
	onPickRepo,
	onSubmit,
}: {
	form: PhoneNewSession;
	onPickRepo: () => void;
	onSubmit: () => void;
}) {
	const { placeholder, submitLabel } = newSessionModes[form.mode];
	return (
		<>
			<PhoneModeSelector form={form} />
			<NewSessionModeError error={form.modeError} onRetry={form.retryMode} />
			<PhoneNewSessionPrompt form={form} placeholder={placeholder} />
			<PhoneRepoRow cwd={form.cwd} onClick={onPickRepo} />
			<PhoneRunOn form={form} />
			<PhoneSheetButton disabled={!form.canSubmit} onClick={onSubmit}>
				{submitLabel}
			</PhoneSheetButton>
		</>
	);
}
