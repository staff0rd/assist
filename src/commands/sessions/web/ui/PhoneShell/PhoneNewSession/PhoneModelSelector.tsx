import Box from "@mui/material/Box";
import type { SessionModel } from "../../App/AppShell/AppOverlays/NewSessionLayer/sessionModel";
import { PhoneSegmented } from "../PhoneSegmented";

const DEFAULT = "";

export function PhoneModelSelector({ model }: { model: SessionModel }) {
	return (
		<Box sx={{ mt: 1 }}>
			<PhoneSegmented
				label="Model"
				options={[DEFAULT, ...model.models]}
				value={model.model ?? DEFAULT}
				onChange={(choice) => model.pick(choice || undefined)}
				optionLabel={(choice) => choice || "Default"}
				mono
			/>
		</Box>
	);
}
