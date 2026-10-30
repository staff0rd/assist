import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

const grabSx = {
	width: 36,
	height: 5,
	borderRadius: "3px",
	bgcolor: "text.disabled",
	opacity: 0.5,
	mx: "auto",
	mb: 0.75,
} as const;

const headerSx = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: 1,
	px: 2,
	pt: 0.75,
	pb: 1.25,
} as const;

const actionSx = {
	color: "primary.main",
	fontSize: 16,
	minHeight: 44,
	px: 0.5,
	borderRadius: 1,
} as const;

type Props = { title: string; actionLabel: string; onAction: () => void };

export function PhoneSheetHeader({ title, actionLabel, onAction }: Props) {
	return (
		<>
			<Box sx={grabSx} />
			<Box sx={headerSx}>
				<Box component="b" sx={{ fontSize: 17, fontWeight: 600 }}>
					{title}
				</Box>
				<ButtonBase sx={actionSx} onClick={onAction}>
					{actionLabel}
				</ButtonBase>
			</Box>
		</>
	);
}
