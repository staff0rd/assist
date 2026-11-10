import { Button, Stack } from "@mui/material";
import type { PreviewStartTarget } from "../../../../../../../shared/PreviewDecision";
import type { PrPreviewChain } from "../../../../../PrPreviewChain";
import { PrPreviewApproveButtons } from "./PrPreviewActions/PrPreviewApproveButtons";
import { PrPreviewChainToggles } from "./PrPreviewActions/PrPreviewChainToggles";

export function PrPreviewActions({
	commentCount,
	chain,
	newPr,
	canStart,
	startOrigin,
	onChainChange,
	onApprove,
	cwd,
	onApproveAndStart,
	onReject,
	onRequestChanges,
}: {
	commentCount: number;
	chain?: PrPreviewChain;
	newPr: boolean;
	canStart: boolean;
	startOrigin?: string | undefined;
	onChainChange: (chain: PrPreviewChain) => void;
	onApprove: () => void;
	cwd?: string | undefined;
	onApproveAndStart: (startOn?: PreviewStartTarget) => void;
	onReject: () => void;
	onRequestChanges: () => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{
				px: 2,
				py: 1.5,
				alignItems: "center",
				justifyContent: "flex-end",
			}}
		>
			{chain && (
				<PrPreviewChainToggles
					chain={chain}
					newPr={newPr}
					onChange={onChainChange}
				/>
			)}
			<Button color="error" variant="outlined" onClick={onReject}>
				Reject
			</Button>
			{commentCount > 0 && (
				<Button color="warning" variant="tonal" onClick={onRequestChanges}>
					Request changes ({commentCount})
				</Button>
			)}
			<PrPreviewApproveButtons
				canStart={canStart}
				startOrigin={startOrigin}
				cwd={cwd}
				onApprove={onApprove}
				onApproveAndStart={onApproveAndStart}
			/>
		</Stack>
	);
}
