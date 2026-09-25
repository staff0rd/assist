import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

type DiffMenuOption = {
	value: string;
	label: string;
	note?: string;
};

export function DiffOptionMenu({
	anchorEl,
	options,
	selected,
	onClose,
	onPick,
}: {
	anchorEl: HTMLElement | null;
	options: readonly DiffMenuOption[];
	selected: string;
	onClose: () => void;
	onPick: (value: string) => void;
}) {
	return (
		<Menu anchorEl={anchorEl} open={anchorEl !== null} onClose={onClose}>
			{options.map((option) => (
				<MenuItem
					key={option.value}
					selected={option.value === selected}
					onClick={() => {
						onClose();
						onPick(option.value);
					}}
					sx={{ fontSize: 12, gap: 1 }}
				>
					{option.label}
					{option.note && (
						<Box component="span" sx={{ color: "text.disabled" }}>
							{option.note}
						</Box>
					)}
				</MenuItem>
			))}
		</Menu>
	);
}
