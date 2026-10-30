import { Box, ThemeProvider } from "@mui/material";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { createDesignTheme } from "../sessions/web/ui/designSystem/createDesignTheme";
import { githubColorMode } from "./githubColorMode";
import { watchGithubColorMode } from "./watchGithubColorMode";

export function CriteriaTheme({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState(() =>
		githubColorMode(document.documentElement),
	);

	useEffect(() => watchGithubColorMode(document.documentElement, setMode), []);

	const theme = useMemo(() => createDesignTheme(mode), [mode]);

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ fontFamily: "fontFamily" }}>{children}</Box>
		</ThemeProvider>
	);
}
