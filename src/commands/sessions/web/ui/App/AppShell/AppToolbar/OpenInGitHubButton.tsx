import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import { toolbarIconSx } from "../../../designSystem/toolbarIconSx";
import { GitHubOutlineIcon } from "./OpenInGitHubButton/GitHubOutlineIcon";
import { apiFetch } from "../../../apiFetch";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";
import { useApiNode } from "../../../useApiNode";
import { withNode } from "../../../withNode";

export function OpenInGitHubButton({ cwd }: { cwd: string }) {
	const [url, setUrl] = useState<string | null>(null);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setUrl(null);
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const res = await apiFetch(
					withNode(`/api/github-url?cwd=${encodeURIComponent(cwd)}`, node),
				);
				const body = await res.json();
				if (!cancelled) setUrl(body?.url ?? null);
			} catch (error) {
				reportCaughtError(error, "GitHub URL");
				if (!cancelled) setUrl(null);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	if (!url) return null;

	return (
		<Tooltip title="Open in GitHub">
			<Box component="span" sx={toolbarIconSx}>
				<IconButton onClick={() => window.open(url, "_blank")}>
					<GitHubOutlineIcon />
				</IconButton>
			</Box>
		</Tooltip>
	);
}
