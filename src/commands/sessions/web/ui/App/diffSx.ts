import { alpha, type Theme } from "@mui/material/styles";
import { syntaxTokenSx } from "./syntaxTokenSx";

export const diffSx = (theme: Theme) => {
	const { success, error, text, primary, divider } = theme.palette;
	return {
		pt: 2,
		"--diff-text-color": text.primary,
		"--diff-selection-background-color": alpha(primary.main, 0.25),
		"--diff-gutter-insert-background-color": alpha(success.main, 0.28),
		"--diff-gutter-delete-background-color": alpha(error.main, 0.28),
		"--diff-code-insert-background-color": alpha(success.main, 0.15),
		"--diff-code-delete-background-color": alpha(error.main, 0.15),
		"--diff-code-insert-edit-background-color": alpha(success.main, 0.4),
		"--diff-code-delete-edit-background-color": alpha(error.main, 0.4),
		"--diff-omit-gutter-line-color": divider,
		"& .diff": { fontSize: 14 },
		"& .diff-gutter": { color: text.secondary },
		...syntaxTokenSx(theme),
	};
};
