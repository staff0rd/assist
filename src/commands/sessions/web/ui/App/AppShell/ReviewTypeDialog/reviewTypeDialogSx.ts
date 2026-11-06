import type { Theme } from "@mui/material/styles";

export function reviewTypeDialogSx(t: Theme) {
	const { title, item, option } = t.tokens.density.reviewDialog;
	return {
		title: { fontSize: title },
		list: {
			"& .MuiMenuItem-root": { fontSize: item },
			"& .MuiFormControlLabel-root .MuiFormControlLabel-label": {
				fontSize: option,
			},
		},
	};
}
