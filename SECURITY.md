# NetGuard Pro: Security & Dependency Manifest (Armor Protocol)

## 🏗️ Version Pinning Policy
- All Python dependencies MUST be strictly pinned in `requirements.txt`.
- No `^`, `~`, or `>=` operators are allowed in production.
- `pyproject.toml` must mirror the strict pinning.

## 🔍 Audit & Verification
- `npm run security-audit` must be run before every build.
- Any vulnerability marked as **HIGH** or **CRITICAL** by `pip-audit` blocks the build.

## 🧹 Maintenance
- Keep `requirements-dev.txt` for local development tools.
- Unused dependencies must be purged immediately.

## 🛡️ Python Engine Constraints
- Use only core libraries where possible.
- Minimal dependency footprint to reduce attack surface.
