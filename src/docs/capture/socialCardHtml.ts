export const socialCardSize = { width: 1200, height: 630 };

export function socialCardHtml(
	screenshotBase64: string,
	logoBase64: string,
	tagline: string,
): string {
	const { width, height } = socialCardSize;
	return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#17171b;font-family:Inter,"Segoe UI",system-ui,sans-serif;color:#ededf0}
.brand{position:absolute;left:72px;top:76px;display:flex;align-items:center;gap:22px}
.brand img{width:80px;height:80px}
.brand span{font-size:62px;font-weight:700;letter-spacing:-2px}
h1{position:absolute;left:72px;top:276px;margin:0;width:450px;font-size:38px;line-height:1.15;font-weight:700;letter-spacing:-.5px}
.url{position:absolute;left:72px;top:536px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:22px;color:#9a9aa6}
.url b{color:#ededf0;font-weight:500}
.shot{position:absolute;left:548px;top:88px;width:1088px;border:1px solid #3a3a44;border-radius:10px 0 0 0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.shot img{display:block;width:100%}
</style></head><body>
<div class="brand"><img src="data:image/png;base64,${logoBase64}"><span>assist</span></div>
<h1>${tagline}</h1>
<div class="url">staffordwilliams.com/<b>assist</b></div>
<div class="shot"><img src="data:image/png;base64,${screenshotBase64}"></div>
</body></html>`;
}
