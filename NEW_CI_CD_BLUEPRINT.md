# 🏗️ NEW_CI_CD_BLUEPRINT.md - Redesigned Workflow Architecture

## 🎯 Modular Design Principles
1. **Separation of Concerns**: Each workflow has one job (Build, Security, Audit).
2. **Centralized Failure Hub**: All failures report to a single "Centralized Failure Log".
3. **Resiliency**: Workflows are parallelized where possible to reduce time-to-feedback.
4. **Supply Chain Integrity**: Pinned SHAs + Fallback stable tags.

---

## 🧱 The 7 Pillars of the New Workflow System

### 1. `security-scan.yml` (Pillar 1: Proactive Defense)
- **Status**: Blocking / Warning.
- **Tools**: `gitleaks`, `flutter analyze --fatal-warnings`, Custom `grep` for TLS/HTTP bypass.
- **Outcome**: Ensures code merged into main is structurally secure.

### 2. `dependency-health.yml` (Pillar 2: Supply Chain Monitoring)
- **Status**: Warning Only.
- **Tools**: `flutter pub outdated`.
- **Outcome**: Alerts developers to stale or vulnerable dependencies without blocking builds.

### 3. `build-apk.yml` (Pillar 3: Android Release)
- **Status**: Production Build.
- **Hardening**: `--obfuscate --split-debug-info`, Sanitized Logs.
- **Outcome**: A secure, verified APK artifact.

### 4. `build-exe.yml` (Pillar 4: Windows Release)
- **Status**: Production Build.
- **Hardening**: Isolated Windows runner, Integrity checksums.
- **Outcome**: A secure, verified EXE artifact.

### 5. `post-build-audit.yml` (Pillar 5: Forensic Verification)
- **Status**: Critical.
- **Logic**: Compares artifacts against `manifest.json`, checks for shadow files, verifies SHA signature consistency.
- **Outcome**: Confirms that the built artifact hasn't been tampered with post-build.

### 6. `simulate-pentest.yml` (Pillar 6: Adversarial Simulation)
- **Status**: Semi-active (Stub).
- **Goal**: A dedicated place for DAST/Owasp ZAP or manual pentest reports to be fed into the CI.

### 7. `failure-centralizer.yml` (The Master Hub)
- **Role**: Listen to all the above.
- **Operation**: 
    - Downloads failure context artifacts.
    - Generates `CENTRALIZED_FAILURE_LOG.md`.
    - Updates Step Summary with "Root Cause" & "Suggested Fix".

---

## ⚙️ Security Standards (Apply to ALL)

- **Permissions**: `contents: read`, `actions: read`, `checks: read`.
- **Concurrency**: Grouped by workflow and branch (`${{ github.workflow }}-${{ github.ref }}`).
- **Cache Shielding**: `key: ${{ runner.os }}-flutter-${{ hashFiles('**/pubspec.lock') }}-${{ github.ref_name }}`.
- **Timeouts**: Strictly enforced (10-25 mins).

---

## 🛠️ Step 1 Actions
1. Deploy `failure-centralizer.yml` (The Foundation).
2. Deploy `security-scan.yml` & `build-apk.yml`.
3. Verify the link between them.

**I am ready to proceed with the implementation once you give me the signal.**
