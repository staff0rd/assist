import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { transferStatus } from "../../../transfer/transferStatus";
import { useTransferContext } from "../../../transfer/useTransferContext";
import type { SessionInfo } from "../../../types";
import { TransferRoute } from "./TransferPanel/TransferRoute";
import { TransferSteps } from "./TransferPanel/TransferSteps";

const panelSx = {
	flex: 1,
	minHeight: 0,
	display: "grid",
	placeItems: "center",
	px: 2,
	py: 4,
	bgcolor: "background.default",
} as const;

const innerSx = {
	display: "grid",
	justifyItems: "center",
	gap: 1.75,
	textAlign: "center",
	maxWidth: 420,
} as const;

const headingSx = { fontWeight: 600 } as const;

const cwdSx = { color: "text.disabled", fontFamily: "fontFamilyMono" } as const;

export function TransferPanel({ session }: { session: SessionInfo }) {
	const { nodes } = useTransferContext();
	const target = session.transfer?.target ?? "";
	const source = session.node ?? nodes?.local ?? "this node";
	const stage = transferStatus(session).stage ?? "snapshotting";
	return (
		<Box
			sx={panelSx}
			role="status"
			aria-live="polite"
			data-testid="transfer-panel"
		>
			<Box sx={innerSx}>
				<TransferRoute source={source} target={target} />
				<Typography component="h2" variant="subtitle1" sx={headingSx}>
					Transferring to {target}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					The session moves with its worktree and history. It opens on {target}{" "}
					when the transfer finishes.
				</Typography>
				<TransferSteps stage={stage} target={target} />
				{session.cwd && (
					<Typography variant="caption" sx={cwdSx}>
						{session.cwd}
					</Typography>
				)}
			</Box>
		</Box>
	);
}
