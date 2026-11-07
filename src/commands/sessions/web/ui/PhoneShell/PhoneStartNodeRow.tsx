import Box from "@mui/material/Box";
import { StartNodePicker } from "../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewFooter/PrPreviewActions/PrPreviewApproveButtons/StartNodePicker";
import type { useStartNodeChoice } from "../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewFooter/PrPreviewActions/PrPreviewApproveButtons/useStartNodeChoice";

export function PhoneStartNodeRow({
	startNode,
}: {
	startNode: ReturnType<typeof useStartNodeChoice>;
}) {
	if (!startNode.nodes || !startNode.target) return null;
	return (
		<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
			<StartNodePicker
				nodes={startNode.nodes}
				options={startNode.options}
				target={startNode.target}
				onPick={startNode.pick}
			/>
		</Box>
	);
}
