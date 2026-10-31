import { satteri } from "@astrojs/markdown-satteri";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLlmsTxt from "starlight-llms-txt";
import { docsSectionsPlugin } from "../src/docs/starlight/docsSectionsPlugin";
import { kbdPlugin } from "../src/docs/starlight/kbdPlugin";
import { docsSidebar } from "../src/docs/starlight/docsSidebar";
import { normalizeBasePath } from "../src/docs/starlight/normalizeBasePath";
import { patchPagefindBundle } from "../src/docs/starlight/patchPagefindBundle";
import { badgePlugin } from "../src/docs/starlight/badgePlugin";
import { iconPlugin } from "../src/docs/starlight/iconPlugin";
import { screenshotsPlugin } from "../src/docs/starlight/screenshotsPlugin";
import { statusPlugin } from "../src/docs/starlight/statusPlugin";

const base = normalizeBasePath(process.env.DOCS_BASE_PATH ?? "/");
const sidebar = docsSidebar();
const preview = process.env.NODE_ENV === "development";
const site = "https://staffordwilliams.com";
const ogImage = `${site}${base}og.png`;
const description = "Enforce determinism in LLM development workflows.";

export default defineConfig({
	site,
	base,
	vite: { server: { allowedHosts: [".ts.net"] } },
	markdown: {
		processor: satteri({
			mdastPlugins: [
				screenshotsPlugin(base, preview),
				kbdPlugin,
				statusPlugin,
				badgePlugin,
				iconPlugin,
			],
			hastPlugins: preview ? [docsSectionsPlugin()] : [],
		}),
	},
	integrations: [
		starlight({
			title: "assist",
			favicon: "/favicon.png",
			logo: { src: "../extension/icons/assist-128.png", alt: "" },
			sidebar,
			pagination: false,
			plugins: [
				starlightLlmsTxt({
					projectName: "assist",
					description,
					customSelectors: {
						all: [
							"figure.assist-screenshot",
							".assist-screenshot-missing",
							".assist-status-icon",
						],
					},
				}),
			],
			customCss: [
				"./src/styles/kbd.css",
				"./src/styles/screenshot.css",
				"./src/styles/dashboard.css",
				"./src/styles/header.css",
				"./src/styles/search.css",
			],
			head: [
				{
					tag: "script",
					content:
						"if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) document.documentElement.dataset.os = 'mac';",
				},
				{
					tag: "script",
					content:
						"try { if (!localStorage.getItem('starlight-theme')) localStorage.setItem('starlight-theme', 'dark'); } catch {}",
				},
				{ tag: "meta", attrs: { property: "og:image", content: ogImage } },
				{ tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
				{ tag: "meta", attrs: { property: "og:image:height", content: "630" } },
				{
					tag: "meta",
					attrs: {
						property: "og:image:alt",
						content: `assist: ${description}`,
					},
				},
				{ tag: "meta", attrs: { name: "twitter:image", content: ogImage } },
			],
			routeMiddleware: preview ? "./src/previewRouteData.ts" : [],
		}),
		{
			name: "assist-docs-preview",
			hooks: {
				"astro:config:setup": ({ injectScript }) => {
					injectScript("page", 'import "/src/screenshotLightbox.ts";');
					if (preview) injectScript("page", 'import "/src/previewReload.ts";');
				},
				"astro:build:done": ({ dir }) => patchPagefindBundle(dir),
			},
		},
	],
});
