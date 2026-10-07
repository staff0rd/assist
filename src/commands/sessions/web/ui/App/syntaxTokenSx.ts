import type { Theme } from "@mui/material/styles";

export const syntaxTokenSx = (theme: Theme) => {
	const { success, error, warning, info, text, primary } = theme.palette;
	return {
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
