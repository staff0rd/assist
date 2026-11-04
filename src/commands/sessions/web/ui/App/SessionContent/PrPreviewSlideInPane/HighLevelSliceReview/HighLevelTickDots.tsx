import { Box } from "@mui/material";
import type { HighLevelTick } from "./highLevelEntryTicks";

function dotSx(on: boolean) {
	return {
		width: 6,
		height: 6,
		borderRadius: "50%",
		border: 1.5,
		borderColor: on ? "success.main" : "text.disabled",
		bgcolor: on ? "success.main" : "transparent",
	} as const;
}

export function HighLevelTickDots({ ticks }: { ticks: HighLevelTick[] }) {
	const done = ticks.filter((tick) => tick.on).length;
	return (
		<Box
			component="span"
			role="img"
			aria-label={`${done} of ${ticks.length} ticked`}
			sx={{ display: "inline-flex", gap: 0.4, alignItems: "center" }}
		>
			{ticks.map((tick) => (
				<Box key={tick.area} component="span" sx={dotSx(tick.on)} />
			))}
		</Box>
	);
}
