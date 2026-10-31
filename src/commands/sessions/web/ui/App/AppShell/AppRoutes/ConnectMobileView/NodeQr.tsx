import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";
import { addNodeLink } from "../../../../addNodeLink";

export function NodeQr({ url, name }: { url: string; name: string }) {
	const theme = useTheme();
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Typography color="text.secondary">
				Scan with the iPhone camera to add this node to the Assist app and make
				it the home node.
			</Typography>
			<Box
				sx={{
					alignSelf: "flex-start",
					bgcolor: "common.white",
					p: 2,
					borderRadius: 1,
					width: (t) => t.spacing(36),
					maxWidth: "100%",
				}}
			>
				<QRCodeSVG
					value={addNodeLink(url, name)}
					title={`Add ${name} to Assist`}
					fgColor={theme.palette.common.black}
					bgColor={theme.palette.common.white}
					style={{ display: "block", width: "100%", height: "auto" }}
				/>
			</Box>
			<Typography sx={{ fontFamily: "fontFamilyMono", wordBreak: "break-all" }}>
				{url}
			</Typography>
		</Box>
	);
}
