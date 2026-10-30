import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import type { NewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import { PhoneSegmented } from "../PhoneSegmented";
import type { PhoneNewSession } from "./usePhoneNewSession";

const modeOrder: NewSessionMode[] = ["prompt", "draft", "bug", "design"];

const modeLabel = (mode: string) => mode[0].toUpperCase() + mode.slice(1);

export function PhoneModeSelector({ form }: { form: PhoneNewSession }) {
	const showHarness = form.mode === "prompt" && form.harnesses.length > 1;
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
				</Box>
			)}
		</>
	);
}
