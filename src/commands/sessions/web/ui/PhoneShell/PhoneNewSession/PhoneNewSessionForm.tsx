import InputBase from "@mui/material/InputBase";
import { NewSessionModeError } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionModeError";
import { newSessionModes } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import { PhoneModeSelector } from "./PhoneModeSelector";
import { PhoneRepoRow } from "./PhoneRepoRow";
import { PhoneRunOn } from "./PhoneRunOn";
import { PhoneSheetButton } from "../PhoneSheetButton";
import type { PhoneNewSession } from "./usePhoneNewSession";

const promptSx = {
	mx: 2,
	my: 1.25,
	minHeight: 120,
	alignItems: "flex-start",
	px: 1.75,
	py: 1.5,
	borderRadius: "12px",
	border: 1,
	borderColor: "divider",
	bgcolor: "background.default",
	fontSize: 16,
	lineHeight: 1.4,
	"&.Mui-focused": { borderColor: "primary.main" },
} as const;

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
			<InputBase
				multiline
				minRows={4}
				maxRows={10}
				value={form.prompt}
				onChange={(e) => form.setPrompt(e.target.value)}
				placeholder={placeholder}
				sx={promptSx}
				inputProps={{ "aria-label": "Prompt" }}
			/>
			<PhoneRepoRow cwd={form.cwd} onClick={onPickRepo} />
			<PhoneRunOn form={form} />
			<PhoneSheetButton disabled={!form.canSubmit} onClick={onSubmit}>
				{submitLabel}
			</PhoneSheetButton>
		</>
	);
}
