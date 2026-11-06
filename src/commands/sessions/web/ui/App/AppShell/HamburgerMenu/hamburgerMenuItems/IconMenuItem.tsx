import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";

export function IconMenuItem({
	icon,
	label,
	onClick,
}: {
	icon: ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<MenuItem onClick={onClick}>
			<ListItemIcon>{icon}</ListItemIcon>
			<ListItemText>{label}</ListItemText>
		</MenuItem>
	);
}
