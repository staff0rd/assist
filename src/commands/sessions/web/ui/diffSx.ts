import { alpha, type Theme } from "@mui/material/styles";

export const diffSx = (theme: Theme) => {
	const { success, error, warning, info, text, primary, divider } =
		theme.palette;
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
		"& .token.comment, & .token.prolog, & .token.doctype, & .token.cdata": {
			color: text.disabled,
			fontStyle: "italic",
		},
		"& .token.punctuation": { color: text.secondary },
		"& .token.keyword, & .token.tag, & .token.selector, & .token.important, & .token.atrule":
			{ color: primary.main },
		"& .token.string, & .token.attr-value, & .token.char, & .token.regex, & .token.url":
			{ color: success.main },
		"& .token.number, & .token.boolean, & .token.constant, & .token.symbol": {
			color: warning.main,
		},
		"& .token.function, & .token.class-name, & .token.builtin": {
			color: info.main,
		},
		"& .token.property, & .token.attr-name, & .token.variable, & .token.namespace, & .token.operator, & .token.entity":
			{ color: text.primary },
		"& .token.deleted": { color: error.main },
		"& .token.inserted": { color: success.main },
	};
};
