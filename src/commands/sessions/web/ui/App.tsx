import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import "react-diff-view/style/index.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AppShell } from "./App/AppShell";
import { captureGlobalErrors } from "./clientFailures/captureGlobalErrors";
import { useColorMode } from "./App/useColorMode";
import { createDesignTheme } from "./designSystem/createDesignTheme";
import { loadFontsBeforeTerminalsOpen } from "./designSystem/loadFontsBeforeTerminalsOpen";
import { HomeNodeGate } from "./HomeNodeGate";
import { isNativeApp } from "./isNativeApp";
import { PhoneShell } from "./PhoneShell";
import { ToastStack } from "./ToastStack";
import { useNativeStatusBarStyle } from "./useNativeStatusBarStyle";

function Root() {
	const { mode, toggle } = useColorMode();
	const theme = useMemo(() => createDesignTheme(mode), [mode]);
	useNativeStatusBarStyle(mode);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<ToastStack>
				<HomeNodeGate>
					{isNativeApp ? (
						<PhoneShell />
					) : (
						<AppShell mode={mode} toggle={toggle} />
					)}
				</HomeNodeGate>
			</ToastStack>
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
	captureGlobalErrors();
	void loadFontsBeforeTerminalsOpen().then(() => {
		createRoot(root).render(<App />);
	});
}
