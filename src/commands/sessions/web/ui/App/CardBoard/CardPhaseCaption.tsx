import Box from "@mui/material/Box";
import { sessionTypeSize } from "../sessionTypeSize";

export function CardPhaseCaption({
	count,
	name,
}: {
	count: string;
	name: string;
}) {
	return (
		<Box
			aria-hidden
			sx={{
				display: "flex",
				gap: 0.75,
				minWidth: 0,
				typography: "caption",
				fontSize: sessionTypeSize("caption"),
				color: "text.secondary",
			}}
		>
			<Box
				component="span"
				sx={{
					fontFamily: "fontFamilyMono",
					fontVariantNumeric: "tabular-nums",
					color: "text.primary",
					flexShrink: 0,
				}}
			>
				{count}
			</Box>
			<Box
				component="span"
				sx={{
					minWidth: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{name}
			</Box>
		</Box>
	);
}
