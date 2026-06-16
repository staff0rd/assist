import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export function ColorModeIcon({ mode }: { mode: "light" | "dark" }) {
	return mode === "dark" ? (
		<Brightness7Icon fontSize="small" />
	) : (
		<Brightness4Icon fontSize="small" />
	);
}
