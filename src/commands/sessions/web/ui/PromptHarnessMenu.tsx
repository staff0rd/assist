import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export function PromptHarnessMenu({
	anchorEl,
	open,
	onClose,
	onSelectPi,
}: {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	onSelectPi: () => void;
}) {
	return (
		<Menu anchorEl={anchorEl} open={open} onClose={onClose}>
			<MenuItem onClick={onSelectPi}>with pi</MenuItem>
		</Menu>
	);
}
