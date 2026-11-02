import { Box } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import type { MouseEvent } from "react";

const toneSx = {
	muted: { color: "text.secondary", bgcolor: "action.selected" },
	critical: (t: Theme) => ({
		color: t.palette.secondary.main,
		bgcolor: alpha(t.palette.secondary.main, 0.14),
	}),
} as const;

export function HighLevelTreeTag({
	label,
	title,
	tone = "muted",
	onClick,
}: {
	label: string;
	title: string;
	tone?: keyof typeof toneSx;
	onClick?: (() => void) | undefined;
}) {
	return (
		<Box
			component={onClick ? "button" : "span"}
			type={onClick ? "button" : undefined}
			title={title}
			onClick={
				onClick &&
				((event: MouseEvent) => {
					event.stopPropagation();
					onClick();
				})
			}
			sx={[
				{
					font: "inherit",
					fontSize: 11,
					fontWeight: 500,
					lineHeight: "18px",
					border: 0,
					borderRadius: 1,
					px: 0.75,
					flexShrink: 0,
					whiteSpace: "nowrap",
					cursor: onClick ? "pointer" : "inherit",
				},
				toneSx[tone],
			]}
		>
			{label}
		</Box>
	);
}
