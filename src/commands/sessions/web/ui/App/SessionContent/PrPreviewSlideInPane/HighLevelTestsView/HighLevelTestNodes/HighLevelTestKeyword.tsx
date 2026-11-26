import { Box } from "@mui/material";

export function HighLevelTestKeyword({ word }: { word: string }) {
	return (
		<Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
			{word}
		</Box>
	);
}
