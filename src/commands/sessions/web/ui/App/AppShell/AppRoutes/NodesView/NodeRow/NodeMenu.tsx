import MoreVertIcon from "@mui/icons-material/MoreVert";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import type { UpdateActions } from "../../nodeUpdates/useUpdateActions";
import type { NodeRowData } from "../nodeRows";
import { updateMenuItems } from "./NodeMenu/updateMenuItems";

export function NodeMenu({
	row,
	actions,
	onRemove,
}: {
	row: NodeRowData;
	actions: UpdateActions;
	onRemove: () => void;
}) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const close = () => setAnchor(null);
	const items = updateMenuItems(row, actions, close);
	return (
		<>
			<IconButton
				size="small"
				aria-haspopup="menu"
				aria-expanded={anchor !== null}
				aria-label={`More actions for ${row.name}`}
				onClick={(event) => setAnchor(event.currentTarget)}
			>
				<MoreVertIcon fontSize="small" />
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={anchor !== null}
				onClose={close}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{items}
				{!row.local && items.length > 0 && <Divider />}
				{!row.local && (
					<MenuItem
						sx={{ color: "error.main" }}
						onClick={() => {
							close();
							onRemove();
						}}
					>
						Remove node…
					</MenuItem>
				)}
			</Menu>
		</>
	);
}
