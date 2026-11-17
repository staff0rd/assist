import type { Theme } from "@mui/material";
import { copyCodeButtonSx } from "./copyCodeButtonSx";

export const copyCodeBlockSx = (theme: Theme) => ({
	"& pre": { position: "relative" },
	"& .copy-code": copyCodeButtonSx(theme),
	"& pre .copy-code": {
		position: "absolute",
		top: theme.spacing(0.5),
		right: theme.spacing(0.5),
		background: theme.palette.background.paper,
	},
});
