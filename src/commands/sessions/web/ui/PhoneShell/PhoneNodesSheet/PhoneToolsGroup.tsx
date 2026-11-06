import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";

export function PhoneToolsGroup({
	onOpenTestflight,
}: {
	onOpenTestflight: () => void;
}) {
	return (
		<>
			<Box sx={nodeListSx.label}>Tools</Box>
			<Box sx={nodeListSx.group}>
				<ButtonBase sx={nodeListSx.item} onClick={onOpenTestflight}>
					<Box component="span" sx={nodeListSx.grow}>
						TestFlight testers
					</Box>
					<Box component="span" sx={nodeListSx.end}>
						<ChevronRightIcon />
					</Box>
				</ButtonBase>
			</Box>
		</>
	);
}
