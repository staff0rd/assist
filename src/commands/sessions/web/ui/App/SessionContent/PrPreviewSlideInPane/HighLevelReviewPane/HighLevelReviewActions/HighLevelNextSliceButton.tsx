import { Box, Button } from "@mui/material";

const keySx = {
	fontFamily: "fontFamilyMono",
	fontSize: 11,
	border: 1,
	borderColor: "divider",
	borderRadius: 0.5,
	px: 0.5,
	ml: 0.75,
	color: "text.secondary",
} as const;

export function HighLevelNextSliceButton({
	onNext,
	disabled,
}: {
	onNext: () => void;
	disabled: boolean;
}) {
	return (
		<Button
			variant="outlined"
			color="inherit"
			onClick={onNext}
			disabled={disabled}
		>
			Next slice
			<Box component="span" sx={keySx}>
				]
			</Box>
		</Button>
	);
}
