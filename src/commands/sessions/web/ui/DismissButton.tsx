export function DismissButton({ onDismiss }: { onDismiss: () => void }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onDismiss();
			}}
			style={{
				background: "none",
				border: "none",
				color: "#888",
				cursor: "pointer",
				fontSize: 16,
				lineHeight: 1,
				padding: "0 2px",
			}}
			title="Dismiss"
		>
			×
		</button>
	);
}
