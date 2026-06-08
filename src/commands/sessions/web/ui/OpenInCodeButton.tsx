import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { VsCodeIcon } from "./VsCodeIcon";

// mr clears the fixed-position ThemeToggle at the toolbar's right edge
const sx = { color: "inherit", mr: 5 } as const;

export function OpenInCodeButton({ cwd }: { cwd: string }) {
	const [error, setError] = useState<string | null>(null);

	async function openInCode(): Promise<void> {
		try {
			const res = await fetch(
				`/api/open-in-code?cwd=${encodeURIComponent(cwd)}`,
				{
					method: "POST",
				},
			);
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				setError(body?.error ?? "Failed to open VS Code");
			}
		} catch {
			setError("Failed to open VS Code");
		}
	}

	return (
		<>
			<Tooltip title="Open in VS Code">
				<span>
					<IconButton sx={sx} disabled={!cwd} onClick={openInCode}>
						<VsCodeIcon />
					</IconButton>
				</span>
			</Tooltip>
			<ErrorSnackbar error={error} onClose={() => setError(null)} />
		</>
	);
}
