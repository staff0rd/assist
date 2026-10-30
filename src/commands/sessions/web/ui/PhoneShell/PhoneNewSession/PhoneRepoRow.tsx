import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import { repoLabel } from "../../App/repoLabel";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSheetItem } from "../PhoneActions/PhoneSheetItem";

export function PhoneRepoRow({
	cwd,
	onClick,
}: {
	cwd: string;
	onClick: () => void;
}) {
	return (
		<Box sx={nodeListSx.group}>
			<PhoneSheetItem
				label="Repo"
				detail={cwd || "No repos on this node"}
				end={
					<>
						{repoLabel(cwd)}
						<ChevronRightIcon fontSize="small" />
					</>
				}
				onClick={onClick}
			/>
		</Box>
	);
}
