import { nextTopItem } from "../../../../../next/nextTopItem";
import { NextHero } from "./NextRecommended/NextHero";
import { nextHeroDetails } from "./NextRecommended/nextHeroDetails";
import type { NextSectionsProps } from "./NextSectionsProps";

export function NextRecommended(props: NextSectionsProps) {
	const top = nextTopItem(props.data);
	if (!top) return null;
	const { repo, number, title, url } = top.item;
	return (
		<NextHero
			repo={repo}
			number={number}
			title={title}
			url={url}
			{...nextHeroDetails(top, props)}
		/>
	);
}
