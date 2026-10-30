import Box from "@mui/material/Box";
import Button, { type ButtonProps } from "@mui/material/Button";

const buttonSx = {
	height: 50,
	borderRadius: "12px",
	fontSize: 17,
	fontWeight: 600,
	textTransform: "none",
} as const;

export function PhoneSheetButton(props: ButtonProps) {
	return (
		<Box sx={{ px: 2.5, pt: 2.5 }}>
			<Button
				variant="contained"
				disableElevation
				fullWidth
				sx={buttonSx}
				{...props}
			/>
		</Box>
	);
}
