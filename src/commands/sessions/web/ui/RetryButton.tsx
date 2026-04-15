export function RetryButton({ onRetry }: { onRetry: () => void }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onRetry();
			}}
			style={{
				background: "none",
				border: "none",
				color: "#888",
				cursor: "pointer",
				fontSize: 14,
				lineHeight: 1,
				padding: "0 2px",
			}}
			title="Retry"
		>
			↻
		</button>
	);
}
