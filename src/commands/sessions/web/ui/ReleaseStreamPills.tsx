import Box from "@mui/material/Box";
import Chip, { type ChipProps } from "@mui/material/Chip";
import type { ReleasePill } from "./releasePill";
import type { ReleaseTone } from "./releaseToneColors";

const toneColor: Record<ReleaseTone, ChipProps["color"]> = {
	ok: "success",
	gate: "warning",
	drift: "error",
	fail: "error",
	idle: "default",
};

const pillsSx = {
	display: "flex",
	flexWrap: "wrap",
	gap: 0.5,
	mt: 1,
	flexDirection: { xs: "row", md: "column" },
	alignItems: "flex-start",
} as const;

const pillSx = {
	height: "auto",
	py: 0.25,
	cursor: "help",
	maxWidth: "100%",
	"& .MuiChip-label": {
		whiteSpace: "normal",
		textAlign: "left",
		fontSize: 11.5,
		px: 1,
	},
} as const;

export function ReleaseStreamPills({
	pills,
	onHighlight,
}: {
	pills: ReleasePill[];
	onHighlight: (ids: string[] | null) => void;
}) {
	if (pills.length === 0) return null;

	return (
		<Box sx={pillsSx}>
			{pills.map((pill) => (
				<Chip
					key={pill.text}
					component="button"
					type="button"
					size="small"
					variant="outlined"
					color={toneColor[pill.tone]}
					label={pill.text}
					sx={pillSx}
					onMouseEnter={() => onHighlight(pill.ids)}
					onMouseLeave={() => onHighlight(null)}
					onFocus={() => onHighlight(pill.ids)}
					onBlur={() => onHighlight(null)}
				/>
			))}
		</Box>
	);
}
