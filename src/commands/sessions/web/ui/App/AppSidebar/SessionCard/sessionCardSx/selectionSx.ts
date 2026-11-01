import type { Theme } from "@mui/material/styles";
import { cardCloseClassName } from "../../../cardCloseClassName";
import { cardTitleClassName } from "../cardTitleClassName";

export function selectionSx(t: Theme, active: boolean) {
	return {
		gridTemplateColumns: "14px minmax(0, 1fr) auto",
		width: `calc(100% - ${t.spacing(1.5)})`,
		mx: 0.75,
		my: "1px",
		p: "7px 8px",
		borderRadius: `${t.tokens.radius.sm}px`,
		border: 1,
		borderColor: active ? "primary.main" : "transparent",
		boxShadow: active
			? `inset 0 0 0 ${t.tokens.selection.ringWidth - 1}px ${t.palette.primary.main}`
			: "none",
		[`& .${cardTitleClassName}`]: {
			fontWeight: active ? t.tokens.selection.titleWeight : undefined,
		},
		[`& .${cardCloseClassName}`]: {
			display: "inline-flex",
			opacity: 0,
			transition: "opacity 0.2s ease",
		},
		[`& .${cardCloseClassName} .MuiIconButton-root`]: {
			width: 20,
			height: 20,
			my: "-2px",
			"& .MuiSvgIcon-root": { fontSize: 14 },
		},
		[`&:hover .${cardCloseClassName}, &:focus-within .${cardCloseClassName}`]: {
			opacity: 1,
		},
		"& [data-testid='git-status-counts'] .MuiLink-root": { fontSize: 11 },
	};
}
