import Chip from "@mui/material/Chip";
import type { NextPickup } from "../../../../../../next/types";

const TYPE_COLORS: Record<string, { light: string; dark: string }> = {
	GRAY: { light: "#59636e", dark: "#9198a1" },
	BLUE: { light: "#0969da", dark: "#4493f8" },
	GREEN: { light: "#1a7f37", dark: "#3fb950" },
	YELLOW: { light: "#9a6700", dark: "#d29922" },
	ORANGE: { light: "#bc4c00", dark: "#db6d28" },
	RED: { light: "#d1242f", dark: "#f85149" },
	PINK: { light: "#bf3989", dark: "#db61a2" },
	PURPLE: { light: "#8250df", dark: "#ab7df8" },
};

export function NextTypeChip({
	type,
}: {
	type: NonNullable<NextPickup["type"]>;
}) {
	const colors = TYPE_COLORS[type.color] ?? TYPE_COLORS.GRAY;
	return (
		<Chip
			label={type.name}
			size="small"
			variant="outlined"
			sx={(theme) => {
				const color =
					theme.palette.mode === "dark" ? colors.dark : colors.light;
				return { color, borderColor: color, height: 20 };
			}}
		/>
	);
}
