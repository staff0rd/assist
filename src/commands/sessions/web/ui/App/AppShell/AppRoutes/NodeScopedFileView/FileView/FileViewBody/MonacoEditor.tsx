import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useRef } from "react";
import type { MonacoEditorSettings } from "./MonacoEditor/createMonacoEditor";
import { useMonacoEditor } from "./MonacoEditor/useMonacoEditor";

const frameSx = (height: string) => (theme: Theme) => ({
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 1,
	overflow: "hidden",
	height,
});

export function MonacoEditor({
	height,
	...settings
}: MonacoEditorSettings & { height: string }) {
	const container = useRef<HTMLDivElement>(null);
	const status = useMonacoEditor(container, settings);

	if (status === "error")
		return (
			<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
				The editor failed to load.
			</Typography>
		);

	return <Box ref={container} sx={frameSx(height)} />;
}
