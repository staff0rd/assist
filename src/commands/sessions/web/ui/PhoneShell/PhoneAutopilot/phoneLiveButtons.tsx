import Button from "@mui/material/Button";
import { phoneItemButtonSx as buttonSx } from "./phoneItemButtonSx";

export function phoneLiveButtons({
	busy,
	onStop,
	onOpen,
}: {
	busy: boolean;
	onStop: () => void;
	onOpen?: () => void;
}) {
	return [
		<Button key="stop" sx={buttonSx.danger} disabled={busy} onClick={onStop}>
			Stop
		</Button>,
		<Button key="open" sx={buttonSx.tonal} disabled={!onOpen} onClick={onOpen}>
			Open session
		</Button>,
	];
}
