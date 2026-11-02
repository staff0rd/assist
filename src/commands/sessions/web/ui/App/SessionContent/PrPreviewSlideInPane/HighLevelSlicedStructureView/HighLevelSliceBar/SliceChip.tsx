import { Box, Chip } from "@mui/material";
import type { ReactNode } from "react";

export function SliceChip({
	pressed,
	muted = false,
	number,
	label,
	onClick,
}: {
	pressed: boolean;
	muted?: boolean;
	number: ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<Chip
			size="small"
			clickable
			variant="outlined"
			color={pressed ? "primary" : "default"}
			aria-pressed={pressed}
			onClick={onClick}
			title={label}
			label={
				<>
					<Box
						component="span"
						sx={{
							fontFamily: "fontFamilyMono",
							fontWeight: 600,
							color: pressed ? "inherit" : "text.secondary",
							mr: 0.75,
						}}
					>
						{number}
					</Box>
					{label}
				</>
			}
			sx={{
				maxWidth: "100%",
				...(muted && !pressed && { color: "text.secondary" }),
			}}
		/>
	);
}
