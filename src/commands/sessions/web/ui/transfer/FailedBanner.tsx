import { Banner } from "./Banner";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineRounded";
import Button from "@mui/material/Button";
import type { SessionInfo } from "../types";
import { useTransferContext } from "./useTransferContext";
import { useTransferTargets } from "./useTransferTargets";

export function FailedBanner({ session }: { session: SessionInfo }) {
	const { nodes, transfer, dismissError } = useTransferContext();
	const targets = useTransferTargets(session, nodes, true);
	const target = session.transfer?.target ?? "";
	const cwd = targets?.find((t) => t.node === target)?.cwd;
	return (
		<Banner
			tone="error"
			icon={<ErrorOutlineIcon fontSize="small" />}
			message={`Transfer to ${target} failed: ${session.transfer?.error}`}
		>
			<Button
				size="small"
				color="error"
				variant="outlined"
				onClick={() => transfer(session.id, target, cwd)}
			>
				Retry
			</Button>
			<Button
				size="small"
				color="inherit"
				onClick={() => dismissError(session.id)}
			>
				Dismiss
			</Button>
		</Banner>
	);
}
