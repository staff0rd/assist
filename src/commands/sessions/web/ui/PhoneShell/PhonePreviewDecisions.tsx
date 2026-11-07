import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { PreviewStartTarget } from "../../../shared/PreviewDecision";
import { useStartNodeChoice } from "../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewFooter/PrPreviewActions/PrPreviewApproveButtons/useStartNodeChoice";
import { PhoneStartNodeRow } from "./PhoneStartNodeRow";

const buttonSx = { borderRadius: "12px", flex: 1, fontWeight: 600 } as const;
const startSx = { ...buttonSx, flex: 1.3 } as const;

export function PhonePreviewDecisions({
	canStart,
	cwd,
	sending,
	onReject,
	onApprove,
	onApproveAndStart,
}: {
	canStart: boolean;
	cwd?: string | undefined;
	sending: boolean;
	onReject: () => void;
	onApprove: () => void;
	onApproveAndStart: (startOn?: PreviewStartTarget) => void;
}) {
	const startNode = useStartNodeChoice(cwd);
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			{canStart && <PhoneStartNodeRow startNode={startNode} />}
			<Box sx={{ display: "flex", gap: 1 }}>
				<Button
					variant="outlined"
					color="error"
					sx={buttonSx}
					disabled={sending}
					onClick={onReject}
				>
					Reject
				</Button>
				<Button
					variant={canStart ? "tonal" : "contained"}
					disableElevation
					sx={buttonSx}
					disabled={sending}
					onClick={onApprove}
				>
					Approve
				</Button>
				{canStart && (
					<Button
						variant="contained"
						disableElevation
						sx={startSx}
						disabled={sending}
						onClick={() => onApproveAndStart(startNode.target)}
					>
						Approve & start
					</Button>
				)}
			</Box>
		</Box>
	);
}
