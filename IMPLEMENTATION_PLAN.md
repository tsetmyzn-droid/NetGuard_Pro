# 🏗️ NetGuard Pro Implementation Plan

## Phase 1: Core Networking (Local Only)
- [x] Create `lib/core/network/router_client.dart` using `Dio`.
- [x] Implement `testConnection(String ip)`.
- [ ] Add `lib/core/network/discovery_service.dart` for local gateway scanning.

## Phase 2: Router Intelligence & Scripts
- [x] Create base interface `lib/core/plugins/router_plugin.dart`.
- [x] Implement `lib/plugins/huawei/huawei_plugin.dart`.
- [x] Implement `lib/plugins/zte/zte_plugin.dart`.
- [ ] Implement `lib/plugins/tplink/tplink_plugin.dart`.

## Phase 3: Analytics Engine (GlassWire Style)
- [ ] Create `lib/core/analytics/traffic_monitor.dart` for precise delta calculations.
- [ ] Implement `lib/core/storage/local_db_service.dart` (Isar) for offline history.

## Phase 4: High-Fidelity UI (GlassWire Inspired)
- [ ] Add `fl_chart` for real-time traffic graphs.
- [ ] Create `lib/features/dashboard/widgets/traffic_graph.dart`.
- [ ] Create `lib/features/dashboard/widgets/device_list.dart`.

## Phase 5: OpenWrt Intelligence Integration
- [ ] Analyze `luci-mobile` and `OpenWrtManager` source architectures.
- [ ] Extract JSON-RPC endpoints for OpenWrt.
- [ ] Implement `lib/plugins/openwrt/openwrt_plugin.dart`.
- [ ] Verify 100% cloud-free operation.

## Phase 6: Final Production & Lockdown
- [x] Configure Github Actions for offline builds.
- [ ] Verify 100% cloud-free operation.
