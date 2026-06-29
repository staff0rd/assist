import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { VersionBadge } from "./VersionBadge";

export function MenuTriggerButton({
	open,
	onOpen,
}: {
	open: boolean;
	onOpen: (anchor: HTMLElement) => void;
}) {
	return (
		<Box
			sx={{
				position: "fixed",
				top: 8,
				right: 16,
				zIndex: (t) => t.zIndex.drawer + 2,
				display: "flex",
				alignItems: "center",
				gap: 0.5,
				color: "inherit",
			}}
		>
			<VersionBadge />
			<IconButton
				onClick={(e) => onOpen(e.currentTarget)}
				size="small"
				sx={{ color: "inherit" }}
				aria-label="Open menu"
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
			>
				<MenuIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
