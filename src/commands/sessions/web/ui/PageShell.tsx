import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import type { Breakpoint } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type PageShellProps = {
	loading: boolean;
	title?: string;
	isEmpty: boolean;
	emptyMessage: string;
	children: ReactNode;
	maxWidth?: Breakpoint | false;
};

export const PageShell = (props: PageShellProps) => {
	const {
		loading,
		title,
		isEmpty,
		emptyMessage,
		children,
		maxWidth = "md",
	} = props;

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth={maxWidth} sx={{ py: 3, px: 2 }}>
			{title && (
				<Typography variant="h6" sx={{ mb: 2 }}>
					{title}
				</Typography>
			)}
			{isEmpty ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					{emptyMessage}
				</Typography>
			) : (
				children
			)}
		</Container>
	);
};
