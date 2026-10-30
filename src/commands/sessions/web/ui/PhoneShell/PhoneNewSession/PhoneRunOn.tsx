import Box from "@mui/material/Box";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSegmented } from "../PhoneSegmented";
import { PhoneNodeOption } from "./PhoneNodeOption";
import type { PhoneNewSession } from "./usePhoneNewSession";

export function PhoneRunOn({ form }: { form: PhoneNewSession }) {
	if (form.nodes.length === 0) return null;
	return (
		<>
			<Box sx={nodeListSx.label}>Run on</Box>
			<PhoneSegmented
				label="Run on"
				options={form.nodes}
				value={form.node}
				onChange={form.setNode}
				optionLabel={(name) => (
					<PhoneNodeOption name={name} links={form.links} />
				)}
				mono
			/>
		</>
	);
}
