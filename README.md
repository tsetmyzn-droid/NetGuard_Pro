# 🛡️ NetGuard Pro (Native Engine)

**Version:** 5.0.0 (Enterprise Secured)  
**Core:** Flutter (Dart) Native  
**Architecture:** Plugin-Based Local Management

---

## 🚀 Overview
**NetGuard Pro** is a high-security, privacy-focused network management tool. It operates **100% locally**, ensuring router credentials and sensitive network data never leave your device. The app provides an enterprise-grade experience for monitoring and managing routers (Huawei, OpenWrt, etc.) without cloud dependencies.

## ✨ Key Features
- **Direct Router Link:** Encrypted local connections to gateways (Huawei, ZTE, TP-Link, OpenWrt).
- **Real-Time Traffic Monitoring:** Visual metrics for network performance.
- **Node Management:** Full visibility and control over connected devices.
- **Security Hardened:** Integrated protection against PII leaks, session hijacking, and reverse engineering.
- **Privacy First:** Zero cloud analytics, zero tracking, and secure-by-default storage.

## 🔒 Security Hardening (Enterprise Grade)
This project has undergone a multi-phase security audit and hardening process:
- **Secure Cookie Storage:** Uses `flutter_secure_storage` with hardware-backed encryption to store session cookies.
- **Certificate Pinning (TOFU):** Implemented Trust-on-First-Use logic to prevent Man-in-the-Middle (MitM) attacks.
- **PII Protection:** Automatic masking of sensitive identifiers (IP/MAC addresses) in diagnostic logs.
- **Runtime Obfuscation:** Release builds are obfuscated and stripped of debug symbols to prevent reverse engineering.

## 🏗️ Hardened CI/CD & Pipeline
Our GitHub Actions pipeline is protected using industry best practices:
- **Supply Chain Security:** All Actions are pinned via verified **Commit SHAs** to prevent third-party injection.
- **Least Privilege:** Workflows run with restricted `permissions: contents: read`.
- **Security Kill Switch:** Automated code analysis using `grep` patterns to block insecure code (e.g., HTTP, TLS bypasses) from reaching production.
- **Artifact Integrity:** Every build produces a `manifest.json` with **SHA256** checksums to verify provenance.

## 📄 Audit & Reports
Detailed security and stability analysis can be found in our internal reports:
- [🛡️ Workflow Security Report](./docs/security/WORKFLOW_SECURITY_REPORT.md)
- [📦 Runtime Hardening Report](./docs/security/RUNTIME_HARDENING_REPORT.md)
- [⚖️ Artifact Integrity Report](./docs/security/ARTIFACT_INTEGRITY_REPORT.md)
- [🛠️ Build Issues & Resolutions](./docs/logs/BUILD_ISSUES_RESOLUTIONS.md)

## 📱 Supported Platforms
- **Android:** Fully optimized native APK.
- **Desktop (Windows):** Native executable with hardened encryption.

## 🛠️ Getting Started
1. Install [Flutter SDK](https://flutter.dev).
2. Clone this repository.
3. Run `flutter pub get`.
4. Build the hardened version:
   ```bash
   flutter build apk --release --obfuscate --split-debug-info=build/debug-info
   ```

---
*Developed for AI Studio Build - Final Security Hardening Phase 2026*
