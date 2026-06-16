import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

export function MenuTriggerButton({
	open,
	onOpen,
}: {
	open: boolean;
	onOpen: (anchor: HTMLElement) => void;
}) {
	return (
		<IconButton
			onClick={(e) => onOpen(e.currentTarget)}
			size="small"
			sx={{
				position: "fixed",
				top: 8,
				right: 16,
				zIndex: (t) => t.zIndex.drawer + 2,
				color: "inherit",
			}}
			aria-label="Open menu"
			aria-haspopup="true"
			aria-expanded={open ? "true" : undefined}
		>
			<MenuIcon fontSize="small" />
		</IconButton>
	);
}
