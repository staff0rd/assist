import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { VsCodeIcon } from "./VsCodeIcon";

const toolbarSx = { color: "inherit" } as const;
const cardSx = {
	color: "text.disabled",
	"&:hover": { color: "text.primary" },
} as const;

export function OpenInCodeButton({
	cwd,
	variant = "toolbar",
}: {
	cwd: string;
	variant?: "toolbar" | "card";
}) {
	const [error, setError] = useState<string | null>(null);
	const isCard = variant === "card";

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
					<IconButton
						aria-label="Open in VS Code"
						size={isCard ? "small" : undefined}
						sx={isCard ? cardSx : toolbarSx}
						disabled={!cwd}
						onClick={(e) => {
							e.stopPropagation();
							void openInCode();
						}}
					>
						<VsCodeIcon sx={isCard ? { fontSize: 14 } : undefined} />
					</IconButton>
				</span>
			</Tooltip>
			<ErrorSnackbar error={error} onClose={() => setError(null)} />
		</>
	);
}
