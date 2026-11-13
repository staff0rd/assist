import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, ButtonGroup } from "@mui/material";
import { type ReactNode, useRef, useState } from "react";
import { StartOverMenu } from "./StartOverMenu";

export function RestartButtonGroup({
	id,
	onStartOver,
	children,
}: {
	id: string;
	onStartOver: () => void;
	children: ReactNode;
}) {
	const groupRef = useRef<HTMLDivElement>(null);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	return (
		<>
			<ButtonGroup
				ref={groupRef}
				variant="outlined"
				color="inherit"
				size="small"
				aria-label="Restart session"
				sx={{
					color: "text.secondary",
					flexShrink: 0,
					"& .MuiButtonGroup-grouped": { borderColor: "divider" },
					"& .MuiButtonGroup-lastButton": { minWidth: 0, px: 0.25 },
				}}
			>
				{children}
				<Button
					aria-label="Restart options"
					aria-haspopup="menu"
					aria-expanded={anchor !== null}
					onClick={(event) => {
						event.stopPropagation();
						setAnchor(groupRef.current);
					}}
				>
					<ArrowDropDownIcon sx={{ fontSize: 16 }} />
				</Button>
			</ButtonGroup>
			<StartOverMenu
				id={id}
				onStartOver={onStartOver}
				anchor={anchor}
				onClose={() => setAnchor(null)}
			/>
		</>
	);
}
