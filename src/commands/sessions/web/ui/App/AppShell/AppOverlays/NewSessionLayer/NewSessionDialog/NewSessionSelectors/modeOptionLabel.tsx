import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../../shared/harnessLabel";

export function modeOptionLabel(harness: HarnessKind | undefined) {
	return (option: string) =>
		option === "prompt" && harness ? (
			<>
				prompt
				<Box component="span" sx={{ fontWeight: 400, whiteSpace: "pre" }}>
					{` · ${harnessLabel(harness)}`}
				</Box>
				<ArrowDropDownIcon sx={{ fontSize: 18, mr: -0.75 }} />
			</>
		) : (
			option
		);
}
