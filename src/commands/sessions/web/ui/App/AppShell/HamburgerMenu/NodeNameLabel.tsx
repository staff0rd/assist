import ListSubheader from "@mui/material/ListSubheader";
import { useNodeName } from "./NodeNameLabel/useNodeName";

const sx = { lineHeight: "32px" } as const;

export function NodeNameLabel() {
	const nodeName = useNodeName();
	if (!nodeName) return null;
	return <ListSubheader sx={sx}>{nodeName}</ListSubheader>;
}
