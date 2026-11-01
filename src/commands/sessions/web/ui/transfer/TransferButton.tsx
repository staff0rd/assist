import MoveUpIcon from "@mui/icons-material/MoveUp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { ActionButton } from "../App/ActionButton";
import type { SessionInfo } from "../types";
import { transferCandidates } from "./transferCandidates";
import { transferStatus } from "./transferStatus";
import { useTransferContext } from "./useTransferContext";
import { useTransferTargets } from "./useTransferTargets";

export function TransferButton({ session }: { session: SessionInfo }) {
	const { nodes, transfer } = useTransferContext();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const targets = useTransferTargets(session, nodes, anchor !== null);
	if (transferCandidates(session, nodes).length === 0) return null;
	const status = transferStatus(session);
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
				{targets === null && <MenuItem disabled>Finding nodes…</MenuItem>}
				{targets?.length === 0 && (
					<MenuItem disabled>No connected node has this repo</MenuItem>
				)}
				{targets?.map((target) => (
					<MenuItem
						key={target.node}
						onClick={() => {
							setAnchor(null);
							transfer(session.id, target.node, target.cwd);
						}}
					>
						{target.node}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
