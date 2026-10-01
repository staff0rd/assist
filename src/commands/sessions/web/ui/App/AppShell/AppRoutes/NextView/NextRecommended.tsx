import { nextTopItem } from "../../../../../next/nextTopItem";
import { matchPrSessions } from "./matchPrSessions";
import { NextHero } from "./NextRecommended/NextHero";
import { nextHeroDetails } from "./NextRecommended/nextHeroDetails";
import type { NextSectionsProps } from "./NextSectionsProps";
import { useNextSessions } from "./useNextSessions";

export function NextRecommended(props: NextSectionsProps) {
	const { sessions } = useNextSessions();
	const top = nextTopItem(props.data);
	if (!top) return null;
	const { repo, number, title, url } = top.item;
	return (
		<NextHero
			repo={repo}
			number={number}
			title={title}
			url={url}
			sessions={
				top.kind === "pr" ? matchPrSessions(sessions, repo, number) : undefined
			}
			{...nextHeroDetails(top, props)}
		/>
	);
}
