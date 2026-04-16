import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AppShell } from "./AppShell";
import { ThemeToggle } from "./ThemeToggle";
import { useColorMode } from "./useColorMode";

export function App() {
	const { mode, toggle } = useColorMode();
	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode,
					...(mode === "dark" && {
						background: { default: "#1e1e1e", paper: "#252526" },
					}),
				},
			}),
		[mode],
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<ThemeToggle mode={mode} toggle={toggle} />
				<AppShell />
			</BrowserRouter>
		</ThemeProvider>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
