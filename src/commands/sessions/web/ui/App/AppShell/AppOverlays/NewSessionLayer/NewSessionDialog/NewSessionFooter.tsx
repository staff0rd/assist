import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { Theme } from "@mui/material/styles";
import {
	FOOTER_HINTS,
	type FooterProps,
	SubmitButton,
} from "./NewSessionFooter/SubmitButton";

const footerSx = (t: Theme) => ({
	alignItems: "flex-end",
	gap: "14px",
	py: "10px",
	pl: "18px",
	pr: 1.5,
	borderTop: 1,
	borderColor: t.tokens.color.lineSoft,
	bgcolor: "background.default",
	fontSize: 12,
	color: "text.secondary",
});

const hintsSx = {
	flex: 1,
	minWidth: 0,
	alignSelf: "center",
	display: "flex",
	flexWrap: "wrap",
	columnGap: "14px",
	rowGap: 0.5,
} as const;

const kbdSx = (t: Theme) => ({
	mr: 0.5,
	px: "5px",
	border: 1,
	borderColor: "divider",
	borderRadius: "4px",
	fontFamily: t.typography.fontFamilyMono,
	fontSize: 10.5,
	color: "text.primary",
});

export function NewSessionFooter(props: FooterProps) {
	return (
		<Stack direction="row" sx={footerSx}>
			<Box data-testid="footer-hints" sx={hintsSx}>
				{FOOTER_HINTS.map(([key, action]) => (
					<span key={key}>
						<Box component="kbd" sx={kbdSx}>
							{key}
						</Box>
						{action}
					</span>
				))}
			</Box>
			<Box sx={{ flexShrink: 0 }}>
				<SubmitButton {...props} />
			</Box>
		</Stack>
	);
}
