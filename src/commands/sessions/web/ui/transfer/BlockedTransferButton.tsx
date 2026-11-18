import MoveUpIcon from "@mui/icons-material/MoveUp";
import Tooltip from "@mui/material/Tooltip";
import { ActionButton } from "../App/ActionButton";

export function BlockedTransferButton({ reason }: { reason: string }) {
	return (
		<Tooltip title={reason}>
			<span>
				<ActionButton
					label="Transfer"
					ariaLabel={`Transfer unavailable: ${reason}`}
					disabled
					icon={<MoveUpIcon sx={{ fontSize: 14 }} />}
					onClick={() => {}}
				/>
			</span>
		</Tooltip>
	);
}
