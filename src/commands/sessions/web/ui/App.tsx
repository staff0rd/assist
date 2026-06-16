import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AppShell } from "./AppShell";
import { HamburgerMenu } from "./HamburgerMenu";
import { useColorMode } from "./useColorMode";

const components = {
	MuiButtonBase: {
		styleOverrides: {
			root: {
				cursor: "pointer",
				"&.Mui-disabled": { cursor: "default" },
			},
		},
	},
	MuiLink: {
		styleOverrides: {
			root: { cursor: "pointer" },
		},
	},
} as const;

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
				components,
			}),
		[mode],
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<HamburgerMenu mode={mode} toggle={toggle} />
				<AppShell />
			</BrowserRouter>
		</ThemeProvider>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
