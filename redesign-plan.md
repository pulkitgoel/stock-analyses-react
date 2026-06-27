# 🏗️ Financial Dashboard Redesign: stocksfundamentals.online

## Core Layout Shift
From: Simple vertical feed
To: **Command Center Dashboard**

## Components to Build

### 1. Top Bar (Live Market Strip)
- FII/DII net numbers (fetch from API)
- Nifty, Nifty IT, Bank Nifty performance
- Horizontal scrolling ticker
- Fixed at top below header

### 2. Hero Section
- Featured latest macro analysis
- Auto-generated thumbnail (gradient + text overlay)
- Big card, CTA button

### 3. Grid Dashboard (replacing vertical list)
- 2-column grid on desktop, 1 on mobile
- Each card has standardized format
- Quick stats per card (delivery %, P/E if available)

### 4. Interactive Tag Filtering (Pills)
- Sticky horizontal tag strip
- Click to filter, active state
- No page reload

### 5. Company Profile Pages
- `/company/:ticker` route
- Live LTP, 52W high/low, P/E ratio header
- List of all deep-dives for that ticker

### 6. Notification Revamp
- Clean subscribe modal (email + Telegram)
- Fallback if push fails
- Flash alerts toggle

### 7. Interactive Charts
- Recharts for FII/DII flow charts
- On analysis detail pages, show chart alongside text

## Timeline
- Phase 1: Top bar + Hero (today)
- Phase 2: Grid + Tags + Company profiles (today)
- Phase 3: Charts + Notifications (today)
