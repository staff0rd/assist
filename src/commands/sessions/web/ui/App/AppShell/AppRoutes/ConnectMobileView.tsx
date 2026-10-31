import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import type { ConnectMobileTarget } from "../../../../connectMobile/ConnectMobileTarget";
import { PageShell } from "../../PageShell";
import { NodeQr } from "./ConnectMobileView/NodeQr";
import { fetchTarget } from "./ConnectMobileView/fetchTarget";

export function ConnectMobileView() {
	const [target, setTarget] = useState<ConnectMobileTarget>();

	useEffect(() => {
		fetchTarget()
			.catch(
				(error): ConnectMobileTarget => ({
					ok: false,
					reason: error instanceof Error ? error.message : String(error),
					remediation: "Check the web server is running and reload this page",
				}),
			)
			.then(setTarget);
	}, []);

	return (
		<PageShell loading={!target} title="Connect mobile">
			{target?.ok ? (
				<NodeQr url={target.url} name={target.name} />
			) : (
				target && (
					<Alert severity="warning">
						<AlertTitle>
							This web server is not serving on the tailnet
						</AlertTitle>
						<Typography>{target.reason}</Typography>
						<Typography sx={{ mt: 1 }}>{target.remediation}</Typography>
					</Alert>
				)
			)}
		</PageShell>
	);
}
