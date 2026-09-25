import Container from "@mui/material/Container";
import type { Breakpoint, SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { PageSpinner } from "./PageSpinner";
import { useReportContentReady } from "../../../useReportContentReady";

type PageShellProps = {
	loading?: boolean;
	title?: string;
	isEmpty?: boolean;
	emptyMessage?: string;
	children: ReactNode;
	maxWidth?: Breakpoint | false;
	sx?: SxProps<Theme>;
};

export const PageShell = (props: PageShellProps) => {
	const {
		loading = false,
		title,
		isEmpty = false,
		emptyMessage,
		children,
		maxWidth = "md",
		sx,
	} = props;

	useReportContentReady(!loading);

	if (loading) return <PageSpinner />;

	return (
		<Container
			maxWidth={maxWidth}
			sx={[{ py: 3, px: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
		>
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
