import Box from "@mui/material/Box";

const bundleSx = {
	fontSize: 12,
	color: "text.secondary",
	fontFamily: "fontFamilyMono",
} as const;

export function TestersDialogTitle({
	sheet,
	bundleId,
}: {
	sheet: boolean;
	bundleId?: string;
}) {
	return (
		<Box sx={{ flex: 1, minWidth: 0 }}>
			<Box
				component="h2"
				id="testflight-testers-title"
				sx={{ m: 0, fontSize: sheet ? 20 : 18, fontWeight: 600 }}
			>
				TestFlight testers
			</Box>
			{bundleId && (
				<Box component="span" sx={bundleSx}>
					{bundleId}
				</Box>
			)}
		</Box>
	);
}
