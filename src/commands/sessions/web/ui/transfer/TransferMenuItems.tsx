import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import type { SessionInfo } from "../types";
import { useTransferContext } from "./useTransferContext";
import type { TransferTarget } from "./useTransferTargets";

const itemSx = { display: "flex", justifyContent: "space-between", gap: 2 };
const cwdSx = {
	fontFamily: "fontFamilyMono",
	fontSize: 11,
	color: "text.secondary",
};

type Props = {
	session: SessionInfo;
	queued: boolean;
	targets: TransferTarget[] | null;
	close: () => void;
};

export function TransferMenuItems({ session, queued, targets, close }: Props) {
	const { transfer, cancel } = useTransferContext();
	if (queued)
		return (
			<MenuItem
				onClick={() => {
					close();
					cancel(session.id);
				}}
			>
				Cancel pending transfer
			</MenuItem>
		);
	if (targets === null) return <MenuItem disabled>Finding nodes…</MenuItem>;
	if (targets.length === 0)
		return <MenuItem disabled>No connected node has this repo</MenuItem>;
	return targets.map((target) => (
		<MenuItem
			key={target.node}
			sx={itemSx}
			onClick={() => {
				close();
				transfer(session.id, target.node, target.cwd);
			}}
		>
			<span>{target.node}</span>
			<Box component="span" sx={cwdSx}>
				{target.cwd}
			</Box>
		</MenuItem>
	));
}
