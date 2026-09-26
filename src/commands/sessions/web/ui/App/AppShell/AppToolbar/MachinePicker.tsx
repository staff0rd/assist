import ComputerIcon from "@mui/icons-material/Computer";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useNodeSelectionContext } from "../../../useNodeSelectionContext";
import { NodeOptionLabel } from "../NodeOptionLabel";

const buttonSx = { ml: 1, textTransform: "none", fontSize: 12 } as const;

export function MachinePicker() {
	const { nodes, names, visible, selected, select } = useNodeSelectionContext();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	if (!visible || !nodes || !selected) return null;

	return (
		<>
			<Button
				size="small"
				color="inherit"
				startIcon={<ComputerIcon fontSize="small" />}
				aria-label="Machine"
				aria-haspopup="menu"
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={buttonSx}
			>
				<NodeOptionLabel nodes={nodes} name={selected} />
			</Button>
			<Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
				{names.map((name) => (
					<MenuItem
						key={name}
						selected={name === selected}
						onClick={() => {
							select(name);
							setAnchor(null);
						}}
						sx={{ fontSize: 13 }}
					>
						<NodeOptionLabel nodes={nodes} name={name} />
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
