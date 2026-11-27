import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { SessionMessage } from "../../../../../../../../../shared/parseSessionMessage";
import { useNavigate } from "react-router";
import { isNativeApp } from "../../../../../../../isNativeApp";
import { useNodeSelectionContext } from "../../../../../../../useNodeSelectionContext";
import { useSessionLaunchContext } from "../../../../../../../useSessionLaunchContext";
import { useTranscriptNodeContext } from "../../../useTranscriptNodeContext";
import { senderSessionId } from "./senderSessionId";

export function SessionMessageLabel({ sender }: { sender: SessionMessage }) {
	const { activateSession } = useSessionLaunchContext();
	const navigate = useNavigate();
	const id = senderSessionId(
		sender.from,
		useTranscriptNodeContext(),
		useNodeSelectionContext().nodes?.local,
	);
	const open = () =>
		isNativeApp ? navigate(`/session/${id}`) : activateSession(id);
	return (
		<>
			From{" "}
			<Link
				component="button"
				type="button"
				onClick={open}
				sx={{
					color: "inherit",
					font: "inherit",
					verticalAlign: "baseline",
					textDecoration: "none",
					borderBottom: 1,
					borderBottomStyle: "dotted",
					"&:hover": { borderBottomStyle: "solid" },
				}}
			>
				session {id}
			</Link>
			{sender.agent && (
				<Box
					component="span"
					sx={{
						fontFamily: "fontFamilyMono",
						fontWeight: 500,
						color: "text.secondary",
						ml: 0.75,
					}}
				>
					{sender.agent}
				</Box>
			)}
		</>
	);
}
