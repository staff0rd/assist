import ComputerIcon from "@mui/icons-material/Computer";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import type { PreviewStartTarget } from "../../../../../../../../../shared/PreviewDecision";
import type { NodesState } from "../../../../../../../types";
import { NodeOptionLabel } from "../../../../../../AppShell/NodeOptionLabel";
import type { StartNodeOption } from "./useStartNodeChoice";

const buttonSx = { textTransform: "none" } as const;

export function StartNodePicker({
	nodes,
	options,
	target,
	onPick,
}: {
	nodes: NodesState;
	options: StartNodeOption[];
	target: PreviewStartTarget;
	onPick: (node: string) => void;
}) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	return (
		<>
			<Button
				size="small"
				color="inherit"
				startIcon={<ComputerIcon fontSize="small" />}
				aria-label="Start on node"
				aria-haspopup="menu"
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={buttonSx}
			>
				<NodeOptionLabel nodes={nodes} name={target.node} />
			</Button>
			<Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
				{options.map(({ name, cwd }) => (
					<MenuItem
						key={name}
						disabled={!cwd}
						selected={name === target.node}
						onClick={() => {
							onPick(name);
							setAnchor(null);
						}}
					>
						<ListItemText
							primary={<NodeOptionLabel nodes={nodes} name={name} />}
							secondary={cwd ? undefined : "no clone"}
						/>
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
