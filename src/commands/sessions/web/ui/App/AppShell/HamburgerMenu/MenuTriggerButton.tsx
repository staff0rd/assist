import Box from "@mui/material/Box";
import { ConfigButton } from "./MenuTriggerButton/ConfigButton";
import { MenuButton } from "./MenuTriggerButton/MenuButton";
import { VersionBadge } from "./MenuTriggerButton/VersionBadge";

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
			<ConfigButton />
			<MenuButton open={open} onOpen={onOpen} />
		</Box>
	);
}
