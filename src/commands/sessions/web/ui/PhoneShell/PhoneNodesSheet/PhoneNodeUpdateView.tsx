import Box from "@mui/material/Box";
import type { PhoneNodeUpdates } from "../PhoneNodeUpdates/usePhoneNodeUpdates";
import { PhoneNodeUpdateDetail } from "./PhoneNodeUpdateDetail";
import { PhoneSheetHeader } from "./PhoneSheetHeader";
import { phoneUpdateNoteSx } from "./phoneUpdateNoteSx";

type Props = {
	name: string;
	updates: PhoneNodeUpdates;
	onBack: () => void;
};

export function PhoneNodeUpdateView({ name, updates, onBack }: Props) {
	const entry = updates.entries.find((e) => e.name === name);
	return (
		<>
			<PhoneSheetHeader
				title={name}
				actionLabel="Back"
				onAction={() => {
					updates.clearMessages();
					onBack();
				}}
			/>
			{entry ? (
				<PhoneNodeUpdateDetail entry={entry} updates={updates} />
			) : (
				<Box sx={phoneUpdateNoteSx}>Checking {name}…</Box>
			)}
		</>
	);
}
