import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { harnessSubline } from "../../../../../../shared/harnessAdapters/harnessLabel";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import {
	harnessFeatureFor,
	type NewSessionMode,
} from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import { PhoneSegmented } from "../PhoneSegmented";
import { PhoneModelSelector } from "./PhoneModelSelector";
import type { PhoneNewSession } from "./usePhoneNewSession";

const modeOrder: NewSessionMode[] = ["prompt", "draft", "bug", "design"];

const modeLabel = (mode: string) => mode[0].toUpperCase() + mode.slice(1);

export function PhoneModeSelector({ form }: { form: PhoneNewSession }) {
	const showHarness =
		harnessFeatureFor(form.mode) !== undefined && form.harnesses.length > 1;
	const subline = harnessSubline(form.harness);
	return (
		<>
			<PhoneSegmented
				label="Mode"
				options={modeOrder}
				value={form.mode}
				onChange={(mode) => form.setMode(mode as NewSessionMode)}
				optionLabel={modeLabel}
			/>
			{showHarness && (
				<Box sx={{ mt: 1 }}>
					<PhoneSegmented
						label="Harness"
						options={form.harnesses}
						value={form.harness}
						onChange={(harness) => form.setHarness(harness as HarnessKind)}
						mono
					/>
					{subline && (
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: "block", mx: 2, mt: 0.5 }}
						>
							{subline}
						</Typography>
					)}
				</Box>
			)}
			{form.model && <PhoneModelSelector model={form.model} />}
		</>
	);
}
