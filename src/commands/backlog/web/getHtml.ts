export function getHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Backlog</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; color: #333; line-height: 1.5; }
  .container { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  header h1 { font-size: 1.5rem; }
  button { cursor: pointer; border: none; border-radius: 6px; padding: 8px 16px; font-size: 0.875rem; font-weight: 500; }
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-secondary { background: #e5e7eb; color: #333; }
  .btn-secondary:hover { background: #d1d5db; }
  .btn-danger { background: #ef4444; color: #fff; }
  .btn-danger:hover { background: #dc2626; }
  .card { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 8px; cursor: pointer; border: 1px solid #e5e7eb; transition: box-shadow 0.15s; display: flex; align-items: center; gap: 12px; }
  .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .status-icon { font-size: 1.1rem; flex-shrink: 0; }
  .status-todo { color: #9ca3af; }
  .status-in-progress { color: #f59e0b; }
  .status-done { color: #22c55e; }
  .card-id { color: #9ca3af; font-size: 0.85rem; flex-shrink: 0; }
  .card-name { font-weight: 500; }
  .detail { background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb; }
  .detail h2 { margin-bottom: 4px; }
  .detail-id { color: #9ca3af; font-size: 0.9rem; margin-bottom: 16px; }
  .detail-section { margin-bottom: 16px; }
  .detail-section h3 { font-size: 0.85rem; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.05em; }
  .detail-section .markdown { line-height: 1.7; }
  .detail-section .markdown p { margin-bottom: 0.5em; }
  .detail-section .markdown pre { background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; }
  .detail-section .markdown code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
  .detail-section .markdown pre code { background: none; padding: 0; }
  .ac-list { list-style: none; }
  .ac-list li { padding: 4px 0; }
  .ac-list li::before { content: "\\2022"; color: #6b7280; margin-right: 8px; }
  .back-link { display: inline-block; margin-bottom: 16px; color: #2563eb; text-decoration: none; font-size: 0.9rem; }
  .back-link:hover { text-decoration: underline; }
  .form { background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb; }
  .form h2 { margin-bottom: 16px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-weight: 500; margin-bottom: 4px; font-size: 0.9rem; }
  .field input, .field textarea { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; font-family: inherit; }
  .field textarea { min-height: 120px; resize: vertical; }
  .ac-inputs { display: flex; flex-direction: column; gap: 8px; }
  .ac-row { display: flex; gap: 8px; }
  .ac-row input { flex: 1; }
  .form-actions { display: flex; gap: 8px; margin-top: 16px; }
  .preview-toggle { font-size: 0.8rem; color: #2563eb; cursor: pointer; margin-left: 8px; }
  .preview-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-top: 8px; min-height: 60px; background: #fafafa; }
  .empty { text-align: center; color: #9ca3af; padding: 48px 16px; }
  .status-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
  .badge-todo { background: #f3f4f6; color: #6b7280; }
  .badge-in-progress { background: #fef3c7; color: #92400e; }
  .badge-done { background: #d1fae5; color: #065f46; }
</style>
</head>
<body>
<div class="container" id="app"></div>
<script src="/bundle.js"></script>
</body>
</html>`;
}
