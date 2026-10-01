import Link from "@mui/material/Link";

export function PortLink({ port }: { port: number }) {
	return (
		<Link
			href={`http://localhost:${port}`}
			target="_blank"
			rel="noopener noreferrer"
			color="inherit"
			onClick={(e) => e.stopPropagation()}
		>
			:{port}
		</Link>
	);
}
