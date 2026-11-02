import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware(({ locals }) => {
	if (locals.starlightRoute.id !== "") return;
	locals.starlightRoute.head.push({
		tag: "base",
		attrs: { href: import.meta.env.BASE_URL },
		content: "",
	});
});
