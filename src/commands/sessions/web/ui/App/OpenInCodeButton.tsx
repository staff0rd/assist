import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { VsCodeIcon } from "./OpenInCodeButton/VsCodeIcon";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";

export function OpenInCodeButton({
	cwd,
	variant = "toolbar",
}: {
	cwd: string;
	variant?: "toolbar" | "card";
}) {
	const [error, setError] = useState<string | null>(null);
	const isCard = variant === "card";
	const node = useApiNode();

	async function openInCode(): Promise<void> {
		try {
			const res = await fetch(
				withNode(`/api/open-in-code?cwd=${encodeURIComponent(cwd)}`, node),
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
					<ActionButton
						label="VS Code"
						ariaLabel="Open in VS Code"
						tone={isCard ? "muted" : "inherit"}
						size={isCard ? "small" : "medium"}
						disabled={!cwd}
						icon={<VsCodeIcon sx={isCard ? { fontSize: 14 } : undefined} />}
						onClick={(e) => {
							e.stopPropagation();
							void openInCode();
						}}
					/>
				</span>
			</Tooltip>
			<ErrorSnackbar error={error} onClose={() => setError(null)} />
		</>
	);
}
