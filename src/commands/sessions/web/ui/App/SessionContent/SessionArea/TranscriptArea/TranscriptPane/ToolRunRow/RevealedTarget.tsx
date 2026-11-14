import Box from "@mui/material/Box";

export function RevealedTarget({ target }: { target: string }) {
	return (
		<Box
			component="pre"
			sx={{
				m: 0,
				ml: 4,
				mb: 0.5,
				typography: "caption",
				fontFamily: "fontFamilyMono",
				color: "text.secondary",
				whiteSpace: "pre-wrap",
				wordBreak: "break-all",
			}}
		>
			{target}
		</Box>
	);
}
