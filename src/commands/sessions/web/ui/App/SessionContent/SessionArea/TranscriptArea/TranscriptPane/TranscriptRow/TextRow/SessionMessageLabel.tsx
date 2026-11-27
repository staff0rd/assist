import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { SessionMessage } from "../../../../../../../../../shared/parseSessionMessage";
import { useNavigate } from "react-router";
import { isNativeApp } from "../../../../../../../isNativeApp";
import { useSessionLaunchContext } from "../../../../../../../useSessionLaunchContext";

export function SessionMessageLabel({ sender }: { sender: SessionMessage }) {
	const { activateSession } = useSessionLaunchContext();
	const navigate = useNavigate();
	const open = () =>
		isNativeApp
			? navigate(`/session/${sender.from}`)
			: activateSession(sender.from);
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
				session {sender.from}
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
