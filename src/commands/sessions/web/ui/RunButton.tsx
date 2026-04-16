import Button from "@mui/material/Button";
import type { RunConfigInfo } from "./types";

function hasParams(c: RunConfigInfo): boolean {
	return (c.params?.length ?? 0) > 0;
}

export function RunButton({
	config,
	active,
	onClick,
}: {
	config: RunConfigInfo;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<Button
			size="small"
			variant={active ? "contained" : "outlined"}
			onClick={onClick}
			sx={{ textTransform: "none", fontSize: 13, py: 0.25, px: 1.25 }}
		>
			{!hasParams(config) && "\u25b6 "}
			{config.name}
		</Button>
	);
}
