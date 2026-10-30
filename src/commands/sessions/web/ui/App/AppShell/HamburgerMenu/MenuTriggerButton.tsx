import Box from "@mui/material/Box";
import { safeAreaInsets } from "../../../designSystem/safeAreaInsets";
import { HelpButton } from "./MenuTriggerButton/HelpButton";
import { ConfigButton } from "./MenuTriggerButton/ConfigButton";
import { MenuButton } from "./MenuTriggerButton/MenuButton";

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
				top: `calc(8px + ${safeAreaInsets.top})`,
				right: 16,
				zIndex: (t) => t.zIndex.drawer + 2,
				display: "flex",
				alignItems: "center",
				gap: 0.5,
				color: (t) =>
					t.tokens.color.appBar?.text ?? t.palette.primary.contrastText,
			}}
		>
			<HelpButton />
			<ConfigButton />
			<MenuButton open={open} onOpen={onOpen} />
		</Box>
	);
}
