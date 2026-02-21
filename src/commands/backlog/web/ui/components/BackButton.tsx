type BackButtonProps = {
	onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
	return (
		<button
			type="button"
			className="back-link"
			onClick={onClick}
			style={{ background: "none", padding: 0 }}
		>
			&larr; Back
		</button>
	);
}
