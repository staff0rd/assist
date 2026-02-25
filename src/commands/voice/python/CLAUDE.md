Never use `pip install` directly. All Python dependency management uses `uv`.

**The venv MUST live in `~/.assist/voice/.venv`, NEVER in this directory or anywhere in the repo.**

Every `uv` command that touches this project MUST set `UV_PROJECT_ENVIRONMENT` to point to the home dir venv. This includes `uv sync`, `uv run`, and any other uv command. There must be no `.venv/`, `__pycache__/`, `*.egg-info/`, or any other generated artifacts in this directory.

- Dependencies are declared in `pyproject.toml`
- Runtime deps (torch, nemo, etc.) are in the `runtime` optional group; dev tools (ruff, xenon, radon) are in `dev`
- Bootstrap uses `uv sync --project <dir> --extra runtime --no-install-project` with `UV_PROJECT_ENVIRONMENT=~/.assist/voice/.venv`
- To add a dependency: edit `pyproject.toml`, then run `UV_PROJECT_ENVIRONMENT=~/.assist/voice/.venv uv lock --project src/commands/voice/python`
- No build system — this is a virtual project, not an installable package
