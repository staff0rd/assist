import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import IconButton from "@mui/material/IconButton";

export function ThemeToggle({
	mode,
	toggle,
}: {
	mode: "light" | "dark";
	toggle: () => void;
}) {
	return (
		<IconButton
			onClick={toggle}
			size="small"
			sx={{
				position: "fixed",
				top: 8,
				right: 16,
				zIndex: (t) => t.zIndex.drawer + 2,
				color: "inherit",
			}}
			aria-label="Toggle light/dark mode"
		>
			{mode === "dark" ? (
				<Brightness7Icon fontSize="small" />
			) : (
				<Brightness4Icon fontSize="small" />
			)}
		</IconButton>
	);
}
