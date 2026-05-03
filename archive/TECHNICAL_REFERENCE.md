# 📚 Technical Reference & Manual — NetGuard Pro

This document serves as the primary source of truth for developers working on the **NetGuard Pro** project. It outlines the architecture, coding standards, and stability protocols.

---

## 🏗️ Project Architecture (Clean Plugin System)

NetGuard Pro follows a modular architecture where the core engine is decoupled from specific router implementations.

### 1. Folder Structure
- `lib/core/`: The "Heart" of the system. Contains the engine, network clients, and storage logic.
- `lib/plugins/`: Specific implementations for different router brands (e.g., `openwrt`, `huawei`).
- `lib/features/`: UI features like the dashboard, traffic graphs, and device lists.
- `lib/OpenWrt/`: Lower-level model and client specifications for the OpenWrt integration.

### 2. RouterPlugin Interface
All router integrations must implement the `RouterPlugin` abstract class:
- `login(user, pass)`: Handles authentication.
- `fetchTraffic()`: Returns real-time delta stats.
- `fetchDevices()`: Lists connected clients via DHCP or ARP tables.

---

## ⚙️ Stability & Development Rules (Anti-Crash System)

To ensure the project remains stable during rapid development or automated fixing, the following rules are mandatory:

### 1. The Golden Rule
- **Flutter Native Only:** This project is strictly Dart/Flutter. Ignore all Node.js, Web, or NPM-related errors in the `lib/` context.
- **Selective Fixing:** Solve a maximum of 3 errors per iteration (Chunk Processing).
- **Size Constraint:** Code patches should not exceed 150 lines per response.

### 2. Stability Loop
1. **Triage:** Identify root causes of a few specific errors.
2. **Surgical Patch:** Apply targeted fixes without rewriting large blocks of code.
3. **Verify:** Always run `flutter analyze` after changes.
4. **0-Error Goal:** Maintain a clean Dart analysis at all times.

---

## 🛡️ Networking & Security (Armor Protocol)

### 1. Local-First Security
- **No Cloud:** All API calls are made to local IP addresses (192.168.x.x).
- **Session Privacy:** Sensitive tokens are held in memory or secure local storage (Isar/Secure Storage).
- **No Tracking:** Zero telemetry or external analytics.

### 2. Dependency Management
- All dependencies must be strictly pinned in `pubspec.yaml`.
- Use `Dio` for robust HTTP networking with custom interceptors for error reporting.

---

## 📊 Analytics Engine (Usage Calculation)

The **NetGuard Engine** calculates speeds using the "Delta Observation" method:
1. Poll interface bytes at interval $t_1$.
2. Poll again at $t_2$.
3. $Speed = (Bytes_{t2} - Bytes_{t1}) / (t_2 - t_1)$.
4. Handles counter resets/overflows gracefully to prevent speed spikes.

---

*Note: This reference is the consolidated authority. Adhere to the "Stability Loop" for all modifications.*
