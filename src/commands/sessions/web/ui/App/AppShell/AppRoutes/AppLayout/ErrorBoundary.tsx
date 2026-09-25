import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("UI error boundary caught:", error, info.componentStack);
	}

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;
		return (
			<Box sx={{ p: 3, maxWidth: 720, mx: "auto", width: "100%" }}>
				<Alert
					severity="error"
					action={
						<Button
							color="inherit"
							size="small"
							onClick={() => globalThis.location.reload()}
						>
							Reload
						</Button>
					}
				>
					<AlertTitle>Something went wrong</AlertTitle>
					{error.message || "An unexpected error occurred rendering this page."}
				</Alert>
			</Box>
		);
	}
}
