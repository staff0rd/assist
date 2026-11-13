import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";

export type Choice = {
	key: string;
	label: string;
	detail?: string;
	checked: boolean;
	pick: () => void;
};

const textSlots = {
	primary: { sx: { fontSize: "inherit" } },
	secondary: { sx: { fontSize: 12 } },
} as const;

export function ChoiceItem({
	choice,
	onClose,
}: {
	choice: Choice;
	onClose: () => void;
}) {
	return (
		<MenuItem
			role="menuitemradio"
			aria-checked={choice.checked}
			selected={choice.checked}
			onClick={() => {
				choice.pick();
				onClose();
			}}
			sx={{ fontSize: 13 }}
		>
			{choice.detail ? (
				<ListItemText
					primary={choice.label}
					secondary={choice.detail}
					slotProps={textSlots}
				/>
			) : (
				choice.label
			)}
		</MenuItem>
	);
}
