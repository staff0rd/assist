import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

type NavigateMenuItemProps = {
	icon: ReactNode;
	label: string;
	to: string;
	onClose: () => void;
};

export function NavigateMenuItem({
	icon,
	label,
	to,
	onClose,
}: NavigateMenuItemProps) {
	const navigate = useNavigate();
	return (
		<MenuItem
			onClick={() => {
				onClose();
				navigate(to);
			}}
		>
			<ListItemIcon>{icon}</ListItemIcon>
			<ListItemText>{label}</ListItemText>
		</MenuItem>
	);
}
