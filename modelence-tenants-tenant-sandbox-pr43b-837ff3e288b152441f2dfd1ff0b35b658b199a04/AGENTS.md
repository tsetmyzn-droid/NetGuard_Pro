# Router Manager App

## Overview
A comprehensive router management and network monitoring application with Arabic/English support.

## Features Implemented

### Core Features
- **Dashboard**: Real-time overview of network usage (daily/weekly/monthly), connected devices count, and connection status
- **Device Management**: View, block/unblock, rename, set speed limits for connected devices
- **Router Settings**: Configure router connection (IP, username, password), WiFi settings (SSID, password, channel, security), bandwidth control
- **System Logs**: View and filter logs by level (info/warning/error/success) and category
- **Error Monitoring**: Dedicated error log view with real-time monitoring

### UI/UX Features
- **Dark/Light Mode**: Full theme support with system preference detection
- **RTL Support**: Complete Arabic language support with proper RTL layout
- **i18n**: Translation system with Arabic and English languages
- **Responsive Design**: Mobile-first with sidebar navigation
- **Animations**: Smooth transitions and loading states

## Technical Architecture

### Database Collections (MongoDB via Modelence Store)
- `routerConfigs`: Router connection settings per user
- `routerDevices`: Connected devices with MAC address, status, speed limits
- `routerUsageStats`: Usage statistics by day/device
- `routerLogs`: System logs with levels and categories
- `routerWifiSettings`: WiFi configuration per user
- `routerPackageInfo`: ISP package/quota information

### Backend Module (`src/server/router/`)
- **Queries**: getConfig, getDevices, getDeviceUsage, getTotalUsage, getDashboardStats, getWifiSettings, getLogs, getErrors, getUsageByDevice
- **Mutations**: saveConfig, upsertDevice, toggleBlockDevice, setDeviceSpeedLimit, updateDeviceName, saveWifiSettings, recordUsage, updatePackageInfo, addLog, clearOldLogs, simulateConnection, deleteDevice

### Frontend Pages (`src/client/pages/`)
- `DashboardPage.tsx`: Main dashboard with usage stats and device overview
- `DevicesPage.tsx`: Device list with actions (block, speed limit, rename, delete)
- `SettingsPage.tsx`: Router and WiFi configuration
- `LogsPage.tsx`: System logs with filtering and export
- `ErrorsPage.tsx`: Error monitoring with real-time updates

### Shared Libraries (`src/client/lib/`)
- `i18n.tsx`: Translation context and hook (useI18n)
- `theme.tsx`: Theme context and hook (useTheme)

### Components (`src/client/components/`)
- `Layout.tsx`: Main app layout with sidebar navigation

## Important Notes

### Router Connection Limitation
This app runs on Modelence Cloud. Direct connection to local network routers (192.168.x.x) is not possible from a cloud-hosted application. The app currently:
1. Stores router configuration for future local agent integration
2. Provides a "simulate connection" feature for testing
3. Allows manual data entry for usage tracking

### For Real Router Integration
Would require:
- A local agent running on the user's network
- Router with external API support (UniFi, MikroTik, OpenWrt)
- Or web scraping approach with local proxy

## Supported Router Models (UI Dropdown)
- **Huawei**: HG630 V2, HG531 V1, HG8245H, DG8045, HG8546M
- **ZTE**: ZXHN H168N, ZXHN H108N, ZXHN F660, ZXV10 W300
- **TP-Link**: Archer C7, Archer C20, TD-W8961N, TL-WR840N
- **D-Link**: DSL-2750U, DIR-615, DSL-2640U
- **Netgear**: R6700, R7000, R8000
- **ASUS**: RT-AC68U, RT-AX86U, RT-N12

## Design System
- Primary colors: Blue palette (primary-50 to primary-900)
- Secondary colors: Slate palette for dark mode
- Font: Cairo (Arabic), Inter (English)
- Animations: fadeIn, slideUp, slideDown defined in Tailwind config
- CSS utility classes in index.css: card, btn-primary, btn-secondary, input-field, badge variants

## Rebranding to NetGuard Pro (for Gemini transfer)
The user is transferring this project to another AI model (Gemini) working on a parallel project named **NetGuard Pro**. A comprehensive guide file has been created:

- **`NETGUARD_PRO_GUIDE.txt`** — Full guide in Arabic explaining:
  - The complete feature list (which must NOT be deleted)
  - Solutions for the black screen UI bug the Gemini agent keeps creating
  - Architecture overview
  - Design system reference
  - Step-by-step migration instructions
  - Warnings about APK/EXE constraints (Modelence cannot produce native apps)

All major code files have been annotated with detailed comments (in Arabic) warning Gemini:
- NOT to delete any features
- Explaining which Providers are critical (causing black screen if removed)
- Listing all queries/mutations/stores that must remain
- Documenting the Tailwind/CSS setup that enables proper UI rendering

Files with annotations:
- `src/client/index.tsx` — Entry point + Providers
- `src/client/index.css` — Global styles + utility classes
- `src/client/router.tsx` — Routes structure
- `src/client/lib/i18n.tsx` — Translation system (appName changed to "NetGuard Pro")
- `src/client/lib/theme.tsx` — Dark/light mode
- `src/client/components/Layout.tsx` — Sidebar + header
- `src/client/pages/*.tsx` — All 5 pages
- `src/server/app.ts` — Server entry
- `src/server/router/db.ts` — Stores definitions
- `src/server/router/index.ts` — Module with queries/mutations
- `tailwind.config.js` — Tailwind settings
