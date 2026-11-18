import TableCell from "@mui/material/TableCell";
import { sessionTextSize } from "../../../../sessionTextSize";

const modelSx = {
	fontFamily: "fontFamilyMono",
	fontSize: sessionTextSize("0.75rem"),
} as const;

export function UsageJobModelCell({ model }: { model: string | null }) {
	return <TableCell sx={modelSx}>{model ?? "—"}</TableCell>;
}
