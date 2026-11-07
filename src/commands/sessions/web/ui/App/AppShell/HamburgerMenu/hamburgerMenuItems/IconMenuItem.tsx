import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

export function IconMenuItem({
	icon,
	label,
	title,
	onClick,
	onKeyDown,
}: {
	icon: ReactNode;
	label: string;
	title?: string;
	onClick: (event: MouseEvent<HTMLElement>) => void;
	onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}) {
	return (
		<MenuItem title={title} onClick={onClick} onKeyDown={onKeyDown}>
			<ListItemIcon>{icon}</ListItemIcon>
			<ListItemText>{label}</ListItemText>
		</MenuItem>
	);
}
