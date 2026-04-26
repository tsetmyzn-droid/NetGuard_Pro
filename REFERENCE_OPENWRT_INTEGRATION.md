# 🧠 OpenWrt Integration Reference (Analytical Guidelines)

This document outlines the strategy for analyzing and extracting logic from `luci-mobile-1.1.8` and `OpenWrtManager-1.40` for use in NetGuard Pro.

## 🎯 Primary Goal
Extract protocol knowledge (API endpoints, login sequences, data parsing) to build a native Dart `OpenWrtPlugin`.

## ⚠️ Integrity Rules
1. **Reference Only**: The source files are for documentation/knowledge discovery. No direct copying of code.
2. **Native Rewrite**: All identified logic must be implemented using `Dio` (Dart) mapping to existing architecture.
3. **No Web Bloat**: Completely ignore UI, JavaScript, and HTML elements found in the sources.
4. **Architecture Compliance**: The result must be a `lib/plugins/openwrt/openwrt_plugin.dart` implementing `RouterPlugin`.

## 🔍 Analysis Checklist
- [ ] **Auth Protocol**: Is it Session-based, Token-based, or Basic Auth?
- [ ] **EndPoints**: 
    - Login path (e.g., `/cgi-bin/luci/rpc/auth`)
    - Device list path (e.g., `/cgi-bin/luci/rpc/sys?method=net.arptable`)
    - Traffic stats path (e.g., `/cgi-bin/luci/rpc/sys?method=net.dev_stats`)
- [ ] **Payload Structure**: JSON-RPC version, method names, and parameter mapping.
- [ ] **Error Handling**: How the router signals session expiry or invalid commands.

## 🏗️ Implementation Target
The implementation will follow the standard Plugin pattern:
- **Location**: `lib/plugins/openwrt/`
- **Class**: `OpenWrtPlugin`
- **Dependencies**: `RouterClient` (core/network).

---
*Ready for file processing. Analysis will begin immediately upon upload.*
