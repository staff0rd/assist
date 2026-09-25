import type { MiroItem } from "../../../../../../../../../../../../../../miro/types";
import { miroBoxStyle } from "./MiroBoardBox/miroBoxStyle";
import type { AnchorRole } from "../useMiroAnchorSelection";

export function MiroBoardBox({
	box,
	role,
	onSelect,
}: {
	box: MiroItem;
	role: AnchorRole | null;
	onSelect: (id: string) => void;
}) {
	const style = miroBoxStyle(box, role);

	return (
		<g
			role="button"
			tabIndex={0}
			aria-label={role ? `${box.text} (${role})` : box.text}
			onClick={() => onSelect(box.id)}
			onKeyDown={(event) => {
				if (event.key === "Enter") onSelect(box.id);
			}}
			style={{ cursor: "pointer" }}
		>
			<rect
				x={box.left}
				y={box.top}
				width={style.width}
				height={style.height}
				rx={style.radius}
				fill={style.colour}
				fillOpacity={style.opacity}
				stroke={style.colour}
				strokeWidth={style.strokeWidth}
			/>
			<text
				x={box.left + style.width / 2}
				y={box.top + style.height / 2}
				textAnchor="middle"
				dominantBaseline="central"
				fontSize={style.fontSize}
				fill="#263238"
			>
				{box.text}
			</text>
		</g>
	);
}
