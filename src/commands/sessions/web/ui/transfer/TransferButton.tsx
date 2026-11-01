import MoveUpIcon from "@mui/icons-material/MoveUp";
import Menu from "@mui/material/Menu";
import { useState } from "react";
import { ActionButton } from "../App/ActionButton";
import type { SessionInfo } from "../types";
import { TransferMenuItems } from "./TransferMenuItems";
import { transferCandidates } from "./transferCandidates";
import { transferStatus } from "./transferStatus";
import { useTransferContext } from "./useTransferContext";
import { useTransferTargets } from "./useTransferTargets";

export function TransferButton({ session }: { session: SessionInfo }) {
	const { nodes } = useTransferContext();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const status = transferStatus(session);
	const targets = useTransferTargets(
		session,
		nodes,
		anchor !== null && !status.queued,
	);
	if (transferCandidates(session, nodes).length === 0) return null;
	return (
		<>
			<ActionButton
				label={status.label}
				title={status.title}
				tone={status.failed ? "starred" : "muted"}
				disabled={status.pending}
				icon={<MoveUpIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setAnchor(e.currentTarget);
				}}
			/>
			<Menu
				anchorEl={anchor}
				open={anchor !== null}
				onClose={() => setAnchor(null)}
			>
				<TransferMenuItems
					session={session}
					queued={status.queued}
					targets={targets}
					close={() => setAnchor(null)}
				/>
			</Menu>
		</>
	);
}
