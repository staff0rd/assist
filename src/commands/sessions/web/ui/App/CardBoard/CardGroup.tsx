import type { ComponentType } from "react";
import type { SessionInfo } from "../../types";
import { BoardGroup } from "./BoardGroup";
import type { BoardGroupProps } from "./BoardGroupProps";

type CardProps = {
	session: SessionInfo;
	selected: boolean;
	onOpen: () => void;
};

export function CardGroup({
	title,
	color,
	card: Card,
	sessions,
	openId,
	onOpen,
}: BoardGroupProps & {
	title: string;
	color: string;
	card: ComponentType<CardProps>;
}) {
	if (sessions.length === 0) return null;
	return (
		<BoardGroup title={title} color={color} count={sessions.length}>
			{sessions.map((s) => (
				<Card
					key={s.id}
					session={s}
					selected={s.id === openId}
					onOpen={() => onOpen(s.id)}
				/>
			))}
		</BoardGroup>
	);
}
