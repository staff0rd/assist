import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import "react-diff-view/style/index.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AppShell } from "./App/AppShell";
import { useColorMode } from "./App/useColorMode";

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

function Root() {
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
			<AppShell mode={mode} toggle={toggle} />
		</ThemeProvider>
	);
}

const dataRouterForNavigationBlocking = createBrowserRouter([
	{ path: "*", element: <Root /> },
]);

export function App() {
	return <RouterProvider router={dataRouterForNavigationBlocking} />;
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
