---
title: Minda Corporation Ltd (MINDACORP) — Radar Deep Dive
code: MINDACORP
date: 2026-11-16
band: small
industry: Automobile and Auto Components
status: private research note — not published
price: 736.15
verdict: WATCH — the operating inflection is real and cheap against its peers; the entry is not, because the stock is 4% under its high with no breakout
data_basis: Screener.in consolidated (27-metric logged-in snapshot, 16 Nov 2026), Q2 FY27 results filing + 30-page investor presentation of 3 Nov 2026, 16-page Q2 FY27 earnings-call transcript of 3 Nov 2026 (filed 11 Nov), NSE corporate-announcements API (1,134 filings, 150 days), NSE sec_bhavdata_full 23 Sep 2025–13 Nov 2026 (283 unique sessions after removing holiday duplicates), NSE index closes for Nifty 50 and Nifty Auto, Tavily news sweep, consensus from Simply Wall St / MarketScreener / Investing.com
---

# Minda Corporation — Radar Deep Dive

Private note for the multibagger radar. Not published, not deployable, not part of the website. One company, one Screener page (consolidated), paced. Every figure is read off an exchange filing, computed from the exchange's own bhavcopy, or labelled as an estimate.

**The one-line case.** Minda Corp is no longer a wiring-harness and lockset maker that happens to sell into EVs — it is becoming an electronics and EV-systems supplier, and the September quarter proved it: revenue +42.6% against an industry that grew 18%, EBITDA margin up 17bps at 11.8%, normalized PAT +69%. It trades at 38x reported, 39x normalized and ~35x my FY27 estimate, which is the **cheapest multiple in its peer set** (Uno Minda 60x, Sona 71x, Tube 63x, median 29x) for the fastest growth in that set. The two things standing between that and a buy are arithmetic and tape: an earnings yield of 2.6% against a 7.31% ten-year G-sec, and a stock sitting 4.3% below its all-time high after a +24% three-week rally, with no breakout and RSI at 69.

---

## 1. Quick Snapshot

| Item | Value |
|---|---|
| Price | ₹736.15 (NSE close 13 Nov 2026; previous close ₹723.35, +1.77%) |
| Market cap | **₹17,600 Cr** (Screener, 16 Nov; ~23.9 Cr shares of ₹2 face) |
| 52-week range | ₹468.50 (12 Mar 2026) to ₹769.00 (14 Aug 2026) — **4.3% below the high**, 57.1% above the low |
| P/E reported TTM | **31.6x** on TTM PAT ₹557 Cr |
| P/E normalized TTM | **39.0x** on ₹451 Cr (reported less the ₹106 Cr Minda VAST exceptional) |
| P/E FY27E / FY28E | **~34.9x / ~25.5x** on EPS ₹21.1 / ₹28.9 (derived here, §11) |
| P/B | **5.9x** on Screener book of ₹124; 5.6x on net worth of ₹3,130 Cr |
| EV/EBITDA | **22.1x** — EV ₹18,914 Cr ÷ TTM EBITDA ₹856 Cr |
| ROCE / ROE | 12.7% / 14.8% (Screener, all capital) — **23.1% ROCE on the company's own basis**, which excludes investments and associate income (Sep 2026 presentation) |
| Debt | Gross ₹1,432 Cr, **net debt ₹1,314 Cr = 1.2x EBITDA, 0.42x net worth**; rating upgraded AA− → **AA** (India Ratings and CRISIL) |
| Dividend | ~₹1.40/share for FY26 (0.19% yield), 9% payout |
| Promoter | **64.84%**, unchanged since March 2024; no pledge row on Screener |
| Next results | Q3 FY27, late January 2027 |
| Radar ledger | Added 9 Nov 2026 at ₹712.65, 5 of 7 gates, band small, score 59.5 |

Performance: **+21.6% over twelve months** (₹605.35 on 13 Nov 2025 to ₹736.15) against Nifty 50 −2.8% and Nifty Auto +2.0%. Over six months **+44.5%** against Nifty +7.4%. Over three months only **+3.4%** — the Mar–Aug re-rating stalled, and the stock fell 23% from its August high to 26 October before recovering 24% in three weeks.

**One data warning before anything else.** Screener's sidebar prints P/E 38.1x **and** earnings yield 3.21% on the same page. Those are inconsistent: 1 ÷ 3.21% is 31.2x, and ₹17,600 Cr ÷ ₹557 Cr of TTM profit is 31.6x. The 38.1x implies an earnings base of about ₹462 Cr, which is neither the reported TTM (₹557 Cr) nor my normalized figure (₹451 Cr) but sits close to the latter. Treat the honest range as **31.6x on reported TTM and 39.0x on normalized TTM**, and ignore the sidebar's 38.1x as a basis you cannot reconcile.

---

## 2. What the Company Does

Minda Corporation is the listed flagship of Spark Minda — the Ashok Minda half of the family split that created Uno Minda (N.K. Minda) in 2012. Both are listed; both sell to the same OEMs; they are competitors, not affiliates.

Six decades of business, 42 plants, 23,000+ people, 8.2 lakh sq ft of land bank with 2.6 lakh sq ft built, 1,000 engineers and 340+ patents. Revenue is reported in two verticals from Q2 FY27:

| Vertical | Q2 FY27 revenue | YoY | Share |
|---|---|---|---|
| Information & Connected Systems (wiring harness, instrument clusters) | **₹1,205 Cr** | +46% | 55% |
| Mechatronics, Aftermarket and Others (vehicle access, die casting, switches, EV electronics) | **₹984 Cr** | +38% | 45% |

By product: wiring harness 31%, vehicle access 24%, die casting 15%, clusters 15%, others 15%. By end market: 2W/3W 49%, passenger vehicles 25%, commercial vehicles and off-highway 8%, aftermarket 18%. By geography: India 89%, Europe and North America 6%, South-East Asia 5%.

**The engineering story is the investment story.** Three product families now carry margin and growth that the legacy business never did:

1. **High-voltage EV systems.** HV wiring harness (100% localised for India's best-selling passenger vehicle), PDU/BDU, busbars, CCS wires, connectors under a SANCO technology licence; chargers including a ₹400 Cr-plus lifetime 3.5 kW order from a 3W OEM with Q1 FY28 SOP; motor controllers via Spark Minda Turntide (49:51, UK).
2. **Driver information.** TFT clusters from 5-inch to 12-inch, most won in association with Qualcomm; a ₹1,000 Cr-plus lifetime order book won in Q2 across 2W, 3W, CV and — for the first time — passenger vehicle platform programmes, with SOP in FY28 onwards.
3. **The 49% associate, Flash Electronics.** ₹1,803 Cr FY26 revenue, 17.2% EBITDA, ₹137 Cr PAT; Q2 FY27 revenue ₹650 Cr, EBITDA ₹106 Cr at 16.4%, PAT ₹54 Cr (+77%). Motor and vehicle controllers, BMS, MCUs, EV powertrain electronics; six plants in India plus two in Germany and Hungary; 21% of its own revenue is EV.

EV products are now **10% of Minda's revenue and 15% at group level**, growing 113% YoY, and **35% of the order book value**.

**Two structural facts that matter more than the product list.**

**Growth in FY27 is partly bought.** Minda VAST Access Systems — the WITTE of Germany joint venture for 4W door handles, locksets, latches and seat-back access — **became a subsidiary on 1 April 2026**. It added ₹125 Cr of revenue in Q1 and a full quarter of PV access-systems revenue to Q2 that was not in the prior-year base. That consolidation also produced a **₹124 Cr exceptional gain pre-tax (₹106 Cr net)** from remeasuring the prior stake. Every "record" this year carries that on top.

**A sixth of profit arrives below the operating line.** Flash is a 49% associate: its ₹54 Cr quarterly PAT contributes about ₹26 Cr to Minda's consolidated profit, and TTM associate income is **₹78 Cr** (Q3 and Q4 FY26 combined 34, plus 18 and 26 this year) out of ₹557 Cr. It carries no revenue and no EBITDA in Minda's P&L, which is why the headline EBITDA margin (11.8%) understates group profitability and why the ROCE debate in §3 exists at all.

---

## 3. Why It Cleared the Gates

The brief calls them eight. `scripts/radar-scorecard.py` defines **seven** mechanical gates; the eighth is the judgement call — does a second engine exist — and it is recorded rather than passed. The ledger says five of seven on the 9 November screen, and five is still right today, but which five deserves stating precisely.

| Gate | Test | MINDACORP today | Result |
|---|---|---|---|
| Headroom | Market cap under ₹25,000 Cr | ₹17,600 Cr | **Pass** |
| Reinvestment | ROCE ≥ 18% | **12.7%** as Screener computes it; 23.1% on the company's own ex-investment basis | **Fail** |
| Durability | 5Y sales CAGR ≥ 15%, margin not compressing | 21.2% (₹2,368 Cr FY21 → ₹6,185 Cr FY26); OPM 9.9% → 11.7% | Pass |
| Quality | CFO/PAT ≥ 0.8, debtor days ≤ 90 | 1.89x (₹676 Cr CFO on ₹358 Cr PAT), 58.7 debtor days | Pass |
| Balance | Debt/equity ≤ 0.5 | **0.58** gross (0.42x net) | **Fail** |
| Management | Promoter ≥ 35% and stable | 64.84%, flat since March 2024 | Pass |
| Valuation | P/E ≤ 1.5x industry, or ≤ 35 | 38.1x vs industry 29.0x (threshold 43.5x) | Pass |

**The reinvestment fail is the interesting one, and it is not a Screener error.** Screener divides EBIT by all capital employed, which includes **₹1,557 Cr of investments** at September 2026 — overwhelmingly the ₹1,372 Cr paid for 49% of Flash in January 2025. Flash's profit does not appear in EBIT; it appears as associate income below the line. So the ratio is asked to earn a return on capital whose return is booked somewhere else. Strip the investments and the associate income out of both numerator and denominator, as the company does, and ROCE is **23.1%** — above the gate.

Both numbers are true and they say different things. The business earns 23.1% on the capital it operates. The ₹1,372 Cr Flash stake earns Minda ₹104 Cr a year at the current run-rate, **about 7.6% pre-tax on cost** — below the cost of capital today, bought at 20.4x Flash's FY26 PAT of ₹137 Cr. That was a growth purchase, not a value purchase, and it is the single reason the consolidated return on total capital looks mediocre.

**The eighth gate passes more clearly than any of the seven.** Wiring harness and clusters are a mature mid-teens-margin business growing with vehicle production. Flash's powertrain electronics earn 16.4% EBITDA and grow 77% in profit; the TFT and HV harness businesses are new categories with 3-5x the content per vehicle; the ECMS-approved display module plant is backward integration into a component that is 40-45% of a display module's bill of materials and currently 100% imported. That is a genuine second engine, and it is why this is a WATCH and not a pass.

---

## 4. Three Years of Accounts

Consolidated, ₹ Cr. FY24–FY26 from the company's own historical income statement (3 Nov 2026 presentation, page 17), which agrees with Screener to within ₹1–2 Cr of rounding; TTM from Screener's quarterly columns.

| ₹ Cr | FY24 | FY25 | FY26 | TTM (Sep 26) |
|---|---|---|---|---|
| Revenue | 4,651 | 5,056 | 6,185 | **7,300** |
| Growth | — | +8.7% | +22.3% | +18.0% |
| EBITDA | 514 | 575 | 721 | **856** |
| EBITDA margin | 11.1% | 11.4% | 11.7% | 11.7% |
| Other income | 16 | 32 | 15 | 136 |
| Depreciation | 166 | 204 | 230 | 254 |
| Finance cost | 56 | 67 | 122 | 124 |
| PBT | 308 | 336 | 383 | 614 |
| Tax | 83 | 96 | 108 | — |
| PAT before associates | 225 | 239 | 277 | — |
| Share of associates/JVs | 2 | 16 | **81** | ~95 |
| **Reported PAT** | **227** | **255** | **358** | **557** |
| EPS (₹) | 9.50 | 10.68 | 15.07 | 23.40 |
| CFO | 287 | 544 | **676** | — |
| Free cash flow | 36 | 202 | **311** | — |
| CFO/EBITDA | 56% | 95% | 94% | — |
| CFO/PAT | 1.26x | 2.13x | 1.89x | — |
| Debtor days | 63 | 60 | 59 | 58.7 |
| Working-capital days | 31 | −28 | −16 | — |
| Borrowings (Screener, year-end) | 540 | 1,614 | 1,476 | 1,712 (Sep 26) |
| Net debt (company, Sep 26 basis) | — | 1,247 | 1,065 | 1,314 |
| ROCE % | 15 | 13 | 13 | 12.7 |

Four things in that table matter more than the growth rate.

**Profit growth has lagged revenue growth for three years, and the reason is now behind it.** From FY23 to FY26 revenue compounded 12.9% and EBITDA 16.1%, but PAT compounded only **8.0%** — because interest went from ₹41 Cr to ₹122 Cr and depreciation from ₹138 Cr to ₹230 Cr. That is the arithmetic of buying Flash with debt and building capacity. FY27 is the first year the acquired assets contribute faster than their financing costs: H1 normalized PAT is already ₹243 Cr against ₹150 Cr, a 62% increase. **The inflection is one half-year old** — that is the whole bull case in one sentence.

**The FY25 balance sheet jump is the Flash deal, not distress.** Borrowings went ₹540 Cr → ₹1,614 Cr and investments ₹348 Cr → ₹1,476 Cr in the same year, with ₹1,409 Cr of investing outflow. That is a ₹1,372 Cr all-cash acquisition of 49% of Flash Electronics, announced 15 January 2025 and closed that month. Net debt has since fallen from ₹1,247 Cr (Mar 2025) to ₹1,065 Cr (Mar 2026) and risen to ₹1,314 Cr at September 2026 on working capital for the record quarter.

**Cash conversion is genuinely good and has never broken.** CFO has been positive in every one of the last eleven years, CFO/EBITDA has run at **94-95% for two years**, free cash flow positive in FY25 and FY26 (₹202 Cr, ₹311 Cr), and working capital is **negative** — 107 days payable against 59 debtor and 66 inventory days, an 18-day cash conversion cycle. Suppliers fund the growth. That is the opposite of the receivables trap that ruins most auto-component stories. One caveat on the ratio: FY26's CFO/PAT of 1.89x is flattered by ₹81 Cr of non-cash associate income in the PAT line; on profit before associates it is 2.44x, so the conclusion holds either way.

**The margin is the flat line that has to break upward.** 11.1% → 11.4% → 11.7% → 11.7% TTM is respectable against copper, wage revisions and freight, but the Vision 2030 target is **12.5% by FY30** and the company runs at 11.8% in its best-ever quarter. A 70bps expansion on ₹17,500 Cr of revenue is ₹120 Cr of extra EBITDA — material, and unproven.

---

## 5. The Last Two Quarters

| ₹ Cr | Q2 FY26 | Q3 FY26 | Q4 FY26 | Q1 FY27 | Q2 FY27 | YoY |
|---|---|---|---|---|---|---|
| Revenue | 1,535 | 1,560 | 1,704 | 1,846 | **2,189** | +42.6% |
| EBITDA | 178 | 184 | 203 | 212 | **257** | +44.7% |
| EBITDA margin | 11.6% | 11.8% | 11.9% | 11.5% | **11.8%** | +17bps |
| Exceptional | — | — | — | **124** | — | — |
| PBT | 93 | 97 | 123 | 237 | **157** | +69.5% |
| Share of associates | 17 | — | — | 18 | **26** | +53% |
| Reported PAT | 85 | 84 | 124 | 206 | **143** | +69.1% |
| Normalized PAT | 85 | 84 | 124 | **100** | **143** | +68.9% |
| EPS (₹) | 3.54 | 3.58 | 5.21 | 8.62 | **5.99** | +69.2% |

**Q1 FY27 (13 Aug 2026)** was the quarter the story changed and the market did not believe it. Revenue ₹1,846 Cr (+33%), EBITDA ₹212 Cr (+35%) at 11.5%, and reported PAT of ₹206 Cr — of which **₹106 Cr net was the Minda VAST consolidation gain**. Normalized PAT was ₹100 Cr, a 43% increase. Minda VAST contributed ₹125 Cr of revenue in the quarter, growing 22% with margin improving from 6.5% to 8.4%. The stock fell 3.3% on the day on 2.86 mn shares, then rose 1.1% the next session on 4.75 mn shares to touch ₹769 — the all-time high.

**Q2 FY27 (3 Nov 2026)** was the quarter that removed the doubt. Revenue ₹2,189 Cr, the first ₹2,000 Cr quarter, **beating consensus of ₹2,011 Cr by 8.9%**; EBITDA ₹257 Cr at 11.8%; PBT ₹157 Cr; PAT ₹143 Cr (+69%); normalized PAT margin 6.5% against 5.5%. Both verticals grew: Information & Connected Systems +46%, Mechatronics +38%. Associate income ₹26 Cr from Flash.

**Three factors cost margin and all three are recoverable.** Management named them on the call: elevated commodity pricing (copper up 4-5% in the wiring-harness book), minimum-wage revisions across several states, and freight. On copper: *"this is all back-to-back indexed with our customers. So of course, there is a lag of one quarter, which we will be compensated by."* A pass-through lag is a timing loss, not a structural one — but it is the second consecutive quarter in which copper has cost margin before recovery, and it explains why 43% revenue growth produced only 17bps of margin expansion.

**New business won in the quarter, with numbers attached:** TFT clusters from 5- to 12-inch with lifetime value **exceeding ₹1,000 Cr**, production FY28 onwards; a 3.5 kW charger order from a leading 3W OEM with lifetime value **exceeding ₹400 Cr**, SOP Q1 FY28; first power-footstep order from an anchor PV customer; sunroof SOP started and won a "Best Supplier — Innovation Excellence" award in its first year. EV products were ~35% of new order wins.

**What is genuinely new and not yet in any number:** MeitY approval on 17 August 2026 under the Electronics Components Manufacturing Scheme for **Minda Instruments to manufacture display module sub-assemblies** — one of only two companies approved for that component in the tranche. A ₹200 Cr greenfield plant in Chakan, SOP ~18 months out, asset turnover guided at 3-4x, targeting **70-80% localisation** of TFT requirements that are today 100% imported. Two captive-solar share subscription agreements in October (26% of Sunsure Solarpark Sixteen; a second with Avener Green/Agganga Energy) support the stated goal of 80-90% renewable power by 2035 from 30-35% today, at a guided saving of ₹2-3 per unit.

**Guidance is qualitative on revenue and firm on nothing else.** There is no FY27 number. There is a Vision 2030 target of **₹17,500 Cr of revenue** (from ₹5,100 Cr in FY25, i.e. 27.9% CAGR over five years — the "20-23% CAGR" quoted in some coverage does not reproduce that arithmetic and should be treated as loose), **EBITDA margin above 12.5%**, **ROCE above 25%**, net debt/equity of 0.3x, exports of ₹1,500 Cr at a 37% CAGR, PV share rising from 14% to 25%, kit value doubling by FY28, and roughly **₹2,000 Cr of capex over five years** (₹400 Cr in FY27).

---

## 6. Shareholding

| | Mar 24 | Mar 25 | Mar 26 | Sep 26 | Change since Mar 25 |
|---|---|---|---|---|---|
| Promoters | 64.84% | 64.84% | 64.84% | **64.84%** | 0.00pp |
| FIIs | 5.07% | 8.33% | 8.80% | **9.36%** | +1.03pp |
| DIIs | 20.60% | 18.48% | 18.82% | **17.92%** | −0.56pp |
| Public | 7.90% | 6.77% | 5.97% | **6.31%** | −0.46pp |
| Others | 1.59% | 1.57% | 1.56% | 1.56% | −0.01pp |
| Shareholders | 1,00,689 | 92,138 | 89,480 | **1,00,704** | +9.3% |

**Promoter holding has not moved a basis point in seven quarters.** No pledge row appears in Screener's table, which prints one when a pledge exists; no promoter share has been sold on the exchange in the visible record.

**FIIs are adding and DIIs are trimming, in a ratio of about 2:1.** FIIs went 8.33% → 9.36% over six quarters (+1.03pp, roughly 25 lakh additional shares); DIIs 18.48% → 17.92% (−0.56pp). Mutual-fund holding specifically was **14.78% at 30 September 2026**. Neither move is an exodus: a 0.56pp DII reduction on a ₹16,000 Cr name is book-keeping, not a thesis call, and it was absorbed by FII buying.

**The shareholder count jumped 12.5% in one quarter** (89,480 → 1,00,704) while the stock fell from ₹712 to ₹632 and then rallied — retail entering on the dip and on the +7% results-week move. For a ₹17,600 Cr cap with 64.84% held by the promoter and roughly 27% by institutions, the free float is small; that is why 3-4x volume days move the price so violently.

---

## 7. Delivery and Price Structure

NSE bhavcopy, **283 unique sessions** from 23 September 2025 to 13 November 2026, after removing holiday duplicates (NSE re-serves the previous session's file on exchange holidays; 8 November 2026 was a genuine Sunday Muhurat session with 58,338 shares, and 15 November was an exact copy of 13 November).

| Session | Close | Volume | Delivery % |
|---|---|---|---|
| 28 Oct | 629.75 | 273,856 | 44.55 |
| 29 Oct | 640.75 | 474,995 | 62.60 |
| 30 Oct | 632.45 | 198,890 | 61.66 |
| 2 Nov | 658.90 | 338,965 | 38.65 |
| **3 Nov (results)** | 684.60 | **1,748,810** | **25.55** |
| 4 Nov | 678.55 | 809,719 | 32.39 |
| 5 Nov | 693.85 | 451,128 | 48.77 |
| 6 Nov | 712.65 | 346,715 | 51.44 |
| 9 Nov | 704.60 | 106,515 | 44.65 |
| 11 Nov | 714.80 | 279,530 | 55.62 |
| 12 Nov | 723.35 | 245,623 | 42.90 |
| **13 Nov** | **736.15** | 342,004 | 41.96 |

Average delivery is **49.7% over 20 sessions, 51.0% over 60 and 47.7% over 120** — comfortably above the ~37% NSE large-cap baseline and in the "genuine accumulation" band. That is the strongest technical fact in this note and it is the opposite of what the Gabriel analysis found.

**But the biggest volume days were churn, not accumulation:**

| Date | Event | Move | Volume | × 20-day avg | Delivery % |
|---|---|---|---|---|---|
| 14 Aug 2026 | Q1 results week, ATH ₹769 | +1.1% | 4,747,307 | 11.5x | **17.4** |
| 22 May 2026 | re-rating begins | +7.0% | 3,251,243 | 11.6x | **18.9** |
| 13 Aug 2026 | Q1 results day | −3.3% | 2,856,496 | 10.3x | 20.0 |
| 25 May 2026 | follow-through | +1.9% | 2,597,068 | 5.9x | 22.5 |
| 3 Nov 2026 | Q2 results day | +3.9% | 1,748,810 | 7.2x | **25.6** |

The pattern is consistent: **event days trade 6-12x normal volume with 17-26% delivery; ordinary days trade normally with 45-62% delivery.** Read together, that says patient buyers are accumulating on quiet days and the noise is intraday. It is a healthier signature than a stock whose every up-day is low-delivery — but it does mean the results-day pop is not evidence of institutional conviction. The follow-through sessions (5, 6, 11, 12, 13 Nov at 42-56% delivery) are the evidence.

Up-day/down-day volume ratio over 60 sessions: **1.33**.

**Price structure in four phases over twelve months:**

1. **Bear, Nov 2025 – Mar 2026.** ₹581 → ₹505.65 (March close), intraday low **₹468.50 on 12 March**, −19% with the market.
2. **Re-rating, Apr – Aug 2026.** ₹520 → ₹769 (14 August, all-time high) — **+48% in four months** on the VAST consolidation, Flash's growth, GST 2.0 demand and Vision 2030.
3. **Distribution, Aug – Oct 2026.** ₹769 → intraday low **₹580 on 26 October**, −23%, with lower highs ₹769 → ₹712 → ₹667 and lower lows ₹685 → ₹661 → ₹580.
4. **Recovery, Nov 2026.** ₹594 (26 Oct close) → **₹736.15 on 13 November, +24% in three weeks**, reclaiming every moving average.

Technicals computed here from the exchange series: **EMA9 ₹704, EMA20 ₹681, EMA50 ₹673, EMA100 ₹664, EMA200 ₹638** — the order is correct (9 > 20 > 50 > 100 > 200), price is above all five, and every EMA is rising over the last ten sessions (EMA9 +12.4%, EMA20 +7.0%, EMA50 +2.3%, EMA100 +1.3%, EMA200 +1.1%). Price is **15.4% above the 200-EMA**.

**RSI(14) 69.4**, up from 65.7 five sessions ago — one point under overbought. **MACD 18.4 against a signal of 7.8**, histogram +10.6 but narrowing from +11.8, i.e. strong but decelerating. **Bollinger %B 92** — price near the upper band (₹750.9). **ATR ₹30.6, or 4.1% of price**. Pivot ₹729, R1 ₹749, R2 ₹761, S1 ₹717, S2 ₹698.

The tape is a stock that has done the work of a recovery and is now knocking on ₹769 with momentum decelerating into resistance.

---

## 8. The 25-Point Swing Assessment

| # | Check | Reading | Verdict |
|---|---|---|---|
| 1 | Price position | 4.3% below the ₹769 all-time high | **Pass** |
| 2 | Trend | Above a rising 200-EMA and +21.6% over 12 months, but the Aug–Oct sequence made lower highs (769 → 712 → 667) and lower lows (685 → 661 → 580) | Caution |
| 3 | Volume characteristics | 49.7% average delivery over 20 sessions and 1.33 up/down volume ratio, but the five largest volume days carried 17–26% delivery | Caution |
| 4 | Clean price action | ATR 4.1%, a 23% drawdown in three months, −3.3% and −3.7% single sessions in October | Caution |
| 5 | EMA alignment | 9 > 20 > 50 > 100 > 200, price above all five, all rising over 10 sessions; EMA50 is 0.45% *below* its level 20 sessions ago | **Pass** |
| 6 | Chart pattern and base | No formed base: an ATH retest after a V-shaped 23% shakeout. Not a cup, flat base, or flag | Caution |
| 7 | Base quality | Three months long (Aug–Nov), 23% deep, volume not drying up inside it | Caution |
| 8 | ADR | ₹30.6 a day, 4.1% of price — tradeable | Pass |
| 9 | Primary uptrend | 200-EMA rising, price 57% off the March low, Nifty 1.2% off its own recovery high | Pass |
| 10 | One trading model | Two defined triggers: close above ₹769 on ≥1.5x volume, or pullback into ₹681–698 holding | Pass |
| 11 | Sector strength | Nifty Auto −5.0% over 3 months but +10.0% over 1 month; industry production +18% in Q2 | Caution |
| 12 | Tailwind | GST 2.0 affordability, record Q2 industry sales, EV penetration, premiumisation, ADAS content | Pass |
| 13 | IPO consideration | Listed 1985 | N/A |
| 14 | Price action strength | +21.6% vs Nifty −2.8% over 12m; +44.5% vs +7.4% over 6m; +3.4% vs Auto −5.0% over 3m | Pass |
| 15 | Sector and government boost | ECMS approval and ₹40,000 Cr scheme outlay, auto PLI, GST 2.0 | Pass |
| 16 | Fundamental quality | ROCE 23.1% operating / 12.7% all-capital, CFO/PAT 1.89x, debtors 59d, net debt 1.2x EBITDA, Piotroski 9 | Pass |
| 17 | Quarterly earnings growth | Revenue +42.6%, EBITDA +44.7%, normalized PAT +68.9% | Pass |
| 18 | Delivery percentage | 49.7% / 51.0% / 47.7% averages, but 25.6% on the results-day spike | Pass |
| 19 | News and institutions | AA upgrade, ₹1,000 Cr TFT order, ECMS; FIIs +1.03pp, DIIs −0.56pp, count +12.5% | Pass |
| 20 | Risk management | Levels and sizing in §15 | Pass |
| 21 | Market environment | Nifty 25,144 at 20.5x, but CPI 6.09% and the 10Y at 7.31% with a December hike expected | Caution |
| 22 | Liquidity | ₹19.3 Cr average daily turnover over 60 sessions; 342,004 shares last session | Pass |
| 23 | Relative strength | +24.5pp vs Nifty over 12m, +37.1pp over 6m, +8.4pp vs Nifty Auto over 3m | Pass |
| 24 | Breakout confirmation | **No breakout: 4.3% below the ATH, last session 0.95x its 20-day average volume** | **Fail** |
| 25 | Trading psychology | The temptation is to chase a +24% three-week move into resistance at 69 RSI. Pass = wait | Pass |

**Score: 19.5 of 25** (16 Pass = 16.0, 7 Caution = 3.5, 1 Fail = 0, item 13 excluded). That is the middle of the "moderate — needs a catalyst" band, and it carries a **critical fail on item 24**, which the checklist treats as disqualifying for entry regardless of score.

The setup is clean, not broken: price above every moving average, delivery at 50%, relative strength positive on every horizon. What is missing is the trigger.

---

## 9. Screener Says

**Pros (verbatim):** "Company is expected to give good quarter." One only.

**Cons (verbatim):** "Stock is trading at 5.91 times its book value"; "Company has a low return on equity of 13.3% over last 3 years"; "Dividend payout has been low at 12.4% of profits over last 3 years".

The book-value con is fair and unarguable: 5.9x book for an 11.8% EBITDA margin component maker is a growth multiple. The ROE con is a lagging statistic that has already turned — 13.3% over three years includes the two years the Flash debt and depreciation ran ahead of the acquired earnings; the current ROE is 14.8% and rising, and H1 annualizes to roughly 17%. The dividend point is a straw man for a company funding ₹2,000 Cr of capex: a 12% payout with a 1.2x net-debt-to-EBITDA ratio is prudent capital allocation, not a flaw.

The machine's pros list is empty of substance because the company fails no mechanical screen — the real pros are that revenue growth is 2.4x the industry and cash conversion is 189% of profit.

---

## 10. Peer Comparison

NSE closes 13 November 2026; P/E, market cap and ROCE from Screener's 16 November marks.

| Company | CMP ₹ | P/E | ROCE | Mcap ₹ Cr | Qtr PAT var |
|---|---|---|---|---|---|
| Samvardhana Motherson | 164.80 | 35.9 | 13.4% | 1,75,638 | +38.1% |
| Bosch | 49,390 | 54.7 | 21.5% | 1,45,681 | +5.2% |
| Bharat Forge | 1,750.50 | 85.4 | 12.6% | 85,542 | −2.8% |
| Uno Minda | 1,388.00 | 59.9 | 19.7% | 80,152 | +38.1% |
| Sona BLW Precision | 919.00 | 71.2 | 15.1% | 57,454 | +17.8% |
| Schaeffler India | 3,585.60 | 41.4 | 27.9% | 56,044 | +20.8% |
| Tube Investments | 2,257.00 | 63.4 | 17.1% | 43,689 | +33.4% |
| **Minda Corporation** | **736.15** | **38.1** | **12.7%** | **17,600** | **+69.1%** |
| Industry median (129 cos) | — | 29.0 | 16.4% | — | +35.0% |

**This is the reverse of the value-destruction pattern the playbook warns about.** Minda has the **lowest P/E in the table** and the **fastest profit growth** (+69% against a peer median of +35%). The usual red flag — high multiple, low returns — is not present. What is present is the honest one: **it also has the second-lowest ROCE** (12.7%, above only Bharat Forge's 12.6%), because a sixth of its capital sits in a 49% associate stake that earns 7.6% on cost.

Adjust for that and the comparison changes: on the company's own operating-capital basis Minda earns **23.1%**, which would be second only to Schaeffler in this table. Minda trades at 0.64x Uno Minda's multiple on 1.8x its profit growth, and at 1.3x the industry median.

**Howard Marks, four methods:**

| Criterion | Test | Result |
|---|---|---|
| Earnings yield vs risk-free | 2.56% (normalized) vs **7.31%** India 10Y G-sec (13 Nov 2026) | **Fail** |
| PEG < 1.0 | 4.9 trailing (on a distorted 3Y CAGR); **1.16 forward** (34.9x ÷ 30% EPS growth) | **Fail, but close on forward** |
| Positive margin of safety on book | Price is 5.9x book; MoS is −494% | **Fail** |
| Price near earnings power value | EPV ₹157 at a 12% cost of capital on normalized EPS ₹18.86; price/EPV **4.7x** | **Fail** |
| ROCE above cost of capital | 23.1% operating vs ~12%; 12.7% blended vs ~12% | **Pass, narrowly on the blended basis** |
| **Composite** | | **Expensive on cash-flow and asset terms; the case is entirely a growth-delivery case** |

Three of five fail, which is what a 39x trailing multiple on a 7.31% risk-free rate produces. The one thing that rescues the framework is the forward path: at 34.9x FY27E and 25.5x FY28E the multiple is unremarkable for a business compounding earnings 30%+.

**The trailing PEG of 4.82 is a base-year artefact and should be ignored.** Screener computes P/E ÷ 3-year profit CAGR. That CAGR is 7.92% because FY23 carried a **1% tax rate** (₹284 Cr PAT on ₹298 Cr PBT) and FY24 normalised to 27% and fell to ₹227 Cr. On EBITDA, which no tax rate distorts, the three-year CAGR is **16.1%**; on H1 FY27 normalized PAT the run-rate growth is **+62%**. Any PEG built on the 7.92% figure is measuring a tax event.

---

## 11. Valuation and Forward Estimates

| Metric | Minda | Basis |
|---|---|---|
| P/E reported TTM | **31.6x** | ₹17,600 Cr ÷ ₹557 Cr |
| P/E normalized TTM | **39.0x** | ₹17,600 Cr ÷ ₹451 Cr (less ₹106 Cr exceptional) |
| P/E FY27E | **~34.9x** | EPS ₹21.1, derived below |
| P/E FY28E | **~25.5x** | EPS ₹28.9, derived below |
| Consensus FY27E | 38.0x | EPS ₹19.38, 10 analysts (Simply Wall St, 6 Nov 2026) |
| P/B | 5.9x | Screener book ₹124/share |
| EV/EBITDA | **22.1x** | EV ₹18,914 Cr ÷ TTM EBITDA ₹856 Cr |
| EV/Sales | 2.6x | |
| Industry P/E | 29.0x | Screener median, 129 cos |
| Nifty Auto P/E | 31.0x | NSE, 13 Nov 2026 |
| Earnings yield | 2.56% | 1 ÷ 39.0 |
| FCF yield | 1.77% | FY26 FCF ₹311 Cr ÷ ₹17,600 Cr |
| Dividend yield | 0.19% | ~₹1.40/share |

**Where the forward numbers come from (my estimates, not analyst figures).** H1 FY27 revenue was ₹4,036 Cr. H2 at +25-30% on H2 FY26's ₹3,264 Cr gives ₹4,080-4,240 Cr, so **FY27 revenue ~₹8,200 Cr (+33%)** — note that the ₹7,990 Cr consensus is *below* H1 annualized and therefore looks stale. At an 11.8% margin that is EBITDA ₹968 Cr; less depreciation ₹285 Cr and interest ₹140 Cr, plus ₹6 Cr other income, gives PBT ₹549 Cr; at a 26% tax rate ₹406 Cr; plus associate income of ~₹100 Cr (49% of Flash's FY27 PAT, annualizing its H1 ₹89 Cr) gives **normalized PAT ~₹505 Cr, EPS ₹21.1**. For FY28, revenue ₹10,000 Cr (+22%), EBITDA margin 12.0%, gives **PAT ~₹690 Cr, EPS ₹28.9**.

**The ₹106 Cr exceptional is the reason reported and normalized disagree by 24%.** It arises from remeasuring Minda VAST on consolidation in Q1 FY27. It is real cash-flow-neutral accounting gain, not recurring, and every multiple in this note on a "normalized" basis excludes it. Investors quoting the 31.6x reported multiple are quoting a number that will not recur.

**The market's number is more conservative than mine.** Ten analysts put FY27 EPS at ₹19.38 after the results (up from ₹18.70), which is 38.0x — 8% below my ₹21.1. Their revenue estimate of ₹7,990 Cr is below the H1 run-rate, so I read the consensus as under-modelled rather than mine as aggressive. Broker targets: Emkay Buy ₹900 (raised from ₹850 on 4 November), consensus mean ₹808.56 across 8 analysts, high ₹900, low ₹675.

---

## 12. Bull Case

1. **The growth is real, broad and accelerating.** Six consecutive quarters of rising YoY revenue growth: +16%, +19%, +25%, +29%, +33%, **+43%**. Both verticals grew (46% and 38%). Even stripping out the ~₹135 Cr of VAST revenue that was not in the prior-year base, organic growth is roughly +34% — still 1.9x the industry's 18%.
2. **EV and electronics content is now a reported number, not a slide.** EV products are 10% of revenue (+113% YoY), 15% at group level, and 35% of the order book. The company has 100% localised HV cabling for India's best-selling passenger vehicle and has won platform-level programmes rather than model-specific ones.
3. **The cheapest multiple in a sector where everything else is expensive.** 38.1x reported / 39.0x normalized against Uno Minda 59.9x, Sona 71.2x, Tube 63.4x and Bharat Forge 85.4x, for the fastest profit growth in the set (+69% vs +35% median). On the peer-set median multiple of 57.3x applied to TTM normalized EPS of ₹18.86, the same earnings would be worth ₹1,080 — 47% above today's price. That is not a forecast; it is a measure of how much of the return depends on the sector's multiple structure rather than on Minda's growth.
4. **The balance sheet has room and the cost of it just fell.** Net debt ₹1,314 Cr is 1.2x EBITDA and 0.42x net worth, CFO is 1.89x PAT, working capital is negative, and India Ratings and CRISIL both upgraded the company to **AA** this year. ₹2,000 Cr of five-year capex is fundable from accruals without dilution.
5. **Backward integration is the margin lever nobody has priced.** TFT display modules are 40-45% of a display module's bill of materials and 100% imported today; ₹200 Cr of capex at 3-4x asset turnover with ECMS incentives, 70-80% localisation and a ₹1,000 Cr-plus order book behind it converts an import cost into a margin. Management will not quantify it on the call — which is precisely why it is not in the price.
6. **Vision 2030 is ambition, but it is measurable against a base that is delivering.** ₹17,500 Cr revenue, 12.5% margin, ROCE above 25%, 0.3x net debt/equity, ₹1,500 Cr of exports at a 37% CAGR, PV share from 14% to 25%. The company has beaten its own five-quarter track record; the next test is Q3.

**Bear Case**

1. **Thirty-nine times normalized earnings with a 2.56% earnings yield against a 7.31% ten-year.** The equity risk premium is negative. Rate hike expectations for December (CPI 6.09% in October, above the RBI's tolerance band) make that worse, not better.
2. **A quarter of the profit growth is bought, not earned.** VAST contributed ₹125 Cr of a ₹1,846 Cr quarter in Q1 and a full quarter in Q2; Flash's ₹26 Cr a quarter arrives with no revenue and no control. Organic growth of ~34% is excellent, but it is not 43%, and from Q1 FY28 the VAST base effect disappears.
3. **ROCE on total capital is 12.7%, and the Flash stake is why.** ₹1,372 Cr — 7.8% of market cap — was paid for 49% of a business earning ₹137 Cr, i.e. 20.4x. At the current run-rate that stake returns ~7.6% pre-tax on cost, below the cost of capital. The deal was strategically right and financially expensive, and the gate that fails is the one about reinvestment.
4. **The margin has not expanded in three years.** 11.1% → 11.4% → 11.7% → 11.7% is a flat line, and Q2's 17bps came on 43% revenue growth. Copper is up 4-5% in the harness book with a one-quarter pass-through lag, wages and freight are rising, and the Vision 2030 target of 12.5% is 70bps away with no stated path.
5. **Customer and cycle concentration.** 49% of revenue is 2W/3W — the most cyclical, most competitive and most EV-disrupted segment in Indian autos — and 89% of revenue is India. A 2W slowdown or a GST-driven demand payback after the record festive quarter hits half the book at once.
6. **Management churn inside three months.** The Company Secretary resigned in August, the CEO of Business Vertical-1 (the ₹984 Cr Mechatronics vertical) resigned effective 17 November 2026, an independent director's term ended on 9 November, and two SMP appointments were filed on 6 November. None of it is alarming alone; all of it together, in the quarter after a record result, is worth watching.
7. **The tape has already failed once at this level.** The stock made ₹769 on 14 August on 11.5x volume with 17.4% delivery, then fell 23% in ten weeks. It is now 4.3% below that high on decelerating MACD and RSI 69. The last test of this level was distribution.

---

## 13. Kill Criteria

Observable within two quarters. Any one of these ends the thesis as written.

1. **Consolidated EBITDA margin below 11.0% in Q3 or Q4 FY27.** The multiple assumes margin holds 11.8% and reaches 12.5% by FY30; two quarters below 11% makes the Vision 2030 margin unreachable and the forward P/E arithmetic collapses.
2. **Revenue growth below 20% YoY in any quarter through FY28.** Organic growth of ~34% is the core claim; sub-20% means the VAST and copper pass-through were most of the headline and the content story is not compounding.
3. **Flash Electronics PAT growth below 20%.** Flash is ~₹78 Cr of associate income (17% of normalized profit) bought at 20.4x. Growth below 20% turns the best strategic deal of the decade into a permanent ROCE drag.
4. **Net debt above ₹2,000 Cr or net debt/EBITDA above 1.5x.** The balance gate already fails at 0.58x gross; ₹2,000 Cr on this EBITDA is where capex plus working capital stops being self-funding.
5. **Any further acquisition from the promoter group paid in shares.** The VAST and Flash deals were both group-adjacent. One is strategy; a pattern without independent valuation is a governance problem, and at 64.84% the promoter does not need minority consent to control the agenda.
6. **The TFT plant slips past FY28 SOP, or ECMS incentives are not claimed.** The ₹200 Cr display-module investment is the clearest quantified margin lever in the story and the only one that has never appeared in a P&L.
7. **A close below ₹594.35** (26 October low). That would break the November recovery structure, take out the 100-EMA at ₹664 and the 200-EMA at ₹638 in sequence, and put the March low back in play.

---

## 14. What Would Change Our View

| Event | Impact on thesis |
|---|---|
| Q3 revenue above ₹2,300 Cr with EBITDA margin at or above 11.8% | Bullish — FY27 EPS moves to ₹22+, the forward multiple drops to 33x, and the "flat margin" objection dies |
| A decisive close above ₹769 on ≥1.5x 20-day volume with delivery above 45% | Bullish technically — items 2, 6, 7 and 24 flip, and the 19.5 score becomes a 22+ setup |
| Flash Electronics crosses ₹200 Cr of annual PAT | Bullish — the ₹1,372 Cr is validated and blended ROCE starts climbing off 12.7% |
| Minda VAST margin sustained above 9% (from 8.4%) | Bullish — the newest consolidated business becomes accretive rather than dilutive to group margin |
| TFT plant capex drawdown disclosed with a commissioning date and a second external OEM customer | Bullish — the backward-integration margin becomes underwritable |
| Roof that 12.5% margin guidance is pulled forward from FY30 | Bullish — removes the main valuation objection |
| Margin below 11.0% in Q3 | Bearish — the multiple has no margin support left |
| Organic growth (ex-VAST, ex-copper pass-through) below 20% | Bearish — the content-per-vehicle story is not compounding |
| Net debt above ₹2,000 Cr | Bearish — capex is outrunning cash generation |
| A close below ₹594.35 | Bearish technically — the November recovery fails and ₹580/₹505 become the references |

---

## 15. Trading and Position Framework

On the 13 November close of ₹736.15 and an ATR of ₹30.6:

- **Entry: not here.** Two valid triggers — (a) a close above **₹769** (the all-time high) on volume ≥1.5x the 20-day average and delivery ≥45%, or (b) a pullback into **₹681–698** (20-EMA to the first pivot support) that holds on declining volume.
- **Stop:** ₹717 on a breakout entry (below S1 ₹717 and the 11 November close of ₹714.80); ₹655 on a pullback entry (below the 100-EMA at ₹664).
- **Targets:** ₹808 (consensus mean), ₹900 (Emkay and the high estimate).
- **Risk/reward:** breakout entry at ₹775 against a ₹717 stop is ₹58 of risk for ₹33 to the consensus ₹808 (0.6:1) and **₹125 to ₹900 (2.2:1)** — the breakout only pays if the ₹900 target is the one that lands. Pullback entry at ₹690 against a ₹655 stop is ₹35 of risk for ₹79 to ₹769 and ₹210 to ₹900 — **2.3:1 to 6.0:1**.
- **Invalidation:** two consecutive closes back below ₹700 after a breakout attempt, or any close below ₹594.35.

Sizing: a ₹17,600 Cr name with ₹19 Cr of average daily turnover and a small free float (64.84% promoter, ~27% institutions). Treat as a **maximum 5% position**, built in two tranches, and re-underwrite after Q3 against the seven kill criteria.

---

## 16. Exchange Filings and Material Announcements (150 days to 13 Nov 2026)

Twenty-three filings were classified as price-moving interest of 1,134 in the symbol's record; routine investor-meet notices, trading-window closures, IEPF reminders and AGM paperwork are excluded. The material set:

- **11 Nov 2026 — Q2 FY27 earnings-call transcript, 16 pages** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_11112026153611_EarningsCallTranscript.pdf)). The full verbatim call of 3 November: the copper pass-through lag, the ₹200 Cr TFT investment and 3-4x asset turnover, the 70-80% localisation target, the 80-90% renewable-by-2035 goal, and the FY30 mix guidance all come from here.
- **3 Nov 2026 — Q2/H1 FY27 results, standalone and consolidated** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_03112026150024_BMOutcome.pdf)). Revenue ₹2,189 Cr, EBITDA ₹257 Cr at 11.8%, PBT ₹157 Cr, PAT ₹143 Cr, associate income ₹26 Cr, unmodified limited review by S.R. Batliboi. Also records the board's approval of a further **₹37 Cr investment in Minda HCMF Technologies** (50:50 JV with HCMF Co. Ltd, Korea), taking the total to ~₹60 Cr, and the completion of independent director Pratima Ram's second term on 9 November.
- **3 Nov 2026 — Q2 FY27 investor presentation, 30 pages** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_03112026152241_InvestorPresenetationQ2FY27.pdf)). Source for the vertical split, the leverage and ROCE table (net debt ₹1,314 Cr, ROCE 23.1%, ND/EBITDA 1.2x), Flash's FY26 and Q2 numbers, the entity structure and the rating table.
- **12 Oct 2026 — share subscription agreement, Sunsure Solarpark Sixteen** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_12102026182038_IntimationtoStxSHAFinal.pdf)). 26% equity in a grid-connected solar generator with ₹9.6 Cr FY26 turnover — captive power, not a business acquisition.
- **14 Oct 2026 — share subscription agreement, Agganga Energy** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_14102026172713_IntimationtoStxSHAAggangasigned.pdf)). Second captive-solar SPV; explicitly not a related-party transaction.
- **18 Aug 2026 — press release on the ECMS approval for Minda Instruments** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_18082026183057_nsebsepressreleaseaugustsigned.pdf)). MeitY approval, granted 17 August, to manufacture display module sub-assemblies — one of two companies cleared for that component in a tranche of 31.
- **13 Aug 2026 — Q1 FY27 results and presentation** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_13082026132122_MCLq1fy27signed.pdf)). The ₹106 Cr exceptional from VAST consolidation, ₹125 Cr of VAST revenue at 8.4% margin, and the ₹2,500 Cr of lifetime orders won in the quarter.
- **20 Jul 2026 — further investment in Spark Minda Green Mobility Systems (wholly-owned subsidiary) under a rights issue** ([PDF](https://nsearchives.nseindia.in/corporate/MINDACORP_20072026114755_Intimationforinvestmentinsubsysigned.pdf)).

Leadership changes in the period, recorded because they are unusual in density: Pardeep Mann resigned as Company Secretary on 21 August (Meenal Bansal appointed 24 September); Sumit Doseja resigned as CEO of Business Vertical-1 effective 17 November 2026; Amit Srivastava appointed CEO of SSD and ASEAN Business from 6 November 2026.

Corporate actions checked: **no split, bonus, buyback or rights issue** in the period. Dividend of ~₹1.40 a share for FY26, a 9% payout.

---

## 17. Verdict

**WATCH — the operating inflection is real and the multiple is the cheapest in its peer set; the entry is not, because the stock is 4% under its high with no breakout.**

For three years Minda Corp paid for growth and did not get paid for it. Interest went from ₹41 Cr to ₹122 Cr and depreciation from ₹138 Cr to ₹230 Cr to buy 49% of Flash and to consolidate VAST, and PAT compounded at 8% while EBITDA compounded at 16%. That is now reversing. H1 FY27 normalized PAT of ₹243 Cr against ₹150 Cr is the first clean evidence that the acquired assets earn more than they cost, and Q2 delivered it with a revenue beat of 8.9% — ₹2,189 Cr against ₹2,011 Cr expected, on 43% growth against an industry at 18%, with the margin up rather than down.

The valuation is genuinely odd for this sector. At 38.1x reported and 39.0x normalized, Minda is the cheapest name in a peer table where Uno Minda trades at 59.9x, Sona at 71.2x and Bharat Forge at 85.4x — and it has the fastest profit growth in that table. On my FY27 estimate of ₹21.1 it is 34.9x; on FY28 it is 25.5x. If the company delivers Vision 2030's revenue line at today's multiple, the earnings triple.

What stops it being a buy is arithmetic and tape together. At a 7.31% ten-year G-sec, a 2.56% earnings yield is not compensation for equity risk; three of the four Howard Marks tests fail. Two of the seven radar gates fail — reinvestment, because a sixth of capital sits in a 49% associate earning 7.6% on cost, and balance, at 0.58x gross debt to equity. And the tape, while healthy (50% average delivery, price above all five EMAs, +24.5pp of relative strength over twelve months), is 4.3% below the ₹769 high that rejected it in August on 11.5x volume and 17% delivery. RSI is 69.4 and MACD is decelerating.

The 25-point score is **19.5 with one critical fail on breakout confirmation**. That is a "wait for the trigger" score, not a "wait for a better company" score.

**What I would do:** nothing at ₹736. Set alerts at **₹769** (breakout, needs 1.5x volume and 45% delivery) and at **₹690** (20-EMA pullback). Take whichever arrives, size at no more than 5% in two tranches, and re-underwrite after Q3 against the seven kill criteria — of which the margin test (below 11.0%) and the organic-growth test (below 20%) are the two that matter most.

**Radar disposition:** mark `analysed` with outcome `watch`. The business has turned; the price has not yet given an entry.

---

## 18. Sources and Data Notes

- **Prices, volume, delivery, highs and lows:** NSE `sec_bhavdata_full`, 23 Sep 2025 – 13 Nov 2026, **283 unique sessions** after removing holiday duplicates (NSE re-serves the previous session's file on exchange holidays; 15 Nov 2026 was an exact copy of 13 Nov). 8 Nov 2026 was a genuine Sunday Muhurat session and is retained.
- **Market cap and share count:** ₹17,600 Cr from Screener's 16 November snapshot; the implied count of 23.91 Cr shares agrees with EPS-implied counts of 23.76–23.87 Cr from the company's own filings. Paid-up equity is ₹48 Cr of ₹2 face value; the small gap to a clean 24.0 Cr is not resolvable from the public filings and does not affect any conclusion.
- **P/E:** the sidebar prints 38.1x and an earnings yield of 3.21%, which are internally inconsistent (1 ÷ 3.21% = 31.2x). This note therefore uses **31.6x on reported TTM PAT (₹557 Cr)** and **39.0x on normalized TTM PAT (₹451 Cr)**, derived from the company's own quarterly filings. The sidebar's 38.1x is reported but not relied on.
- **Technicals:** computed here from the exchange series — EMA 9/20/50/100/200, SMA 50/200, RSI 14 (Wilder), MACD 12-26-9, Bollinger 20-2, ATR 14, classic pivots. **TradingView was not used**: this run had no browser session, and the exchange closes are the primary record. No statement in this note depends on a yfinance feed.
- **EMA200 caveat:** the window is 283 sessions, so the 200-EMA has ~83 sessions of warm-up and the ₹638 level is approximate to within a few per cent. The conclusion — price 15.4% above a rising 200-day average — does not depend on the exact value.
- **Fundamentals:** Screener.in consolidated, **27-metric logged-in snapshot taken 16 November 2026** (pre-flight count check returned 27, not the 9 of an expired session). Annual FY24–FY26 figures cross-checked against the company's own historical income statement in the 3 November presentation; they agree to within ₹1–2 Cr of rounding.
- **ROCE, two definitions:** 12.7% is Screener's (EBIT ÷ all capital employed, including ₹1,557 Cr of investments). 23.1% is the company's, which the presentation footnotes as excluding investments and the share of profit of JVs/associates. Both are quoted; neither is presented as the only truth.
- **Net debt:** ₹1,314 Cr is the company's own September 2026 figure (gross debt ₹1,432 Cr less cash ₹118 Cr). Screener's "borrowings" of ₹1,712 Cr is higher because it includes lease liabilities and acceptances; Screener's gross D/E of 0.58 uses that figure. Both are disclosed because they support opposite readings of the balance gate.
- **Concall:** the full 16-page transcript of the 3 November 2026 call was read, not summarised from the press release. Every management quotation is from that document.
- **Filings:** NSE corporate-announcements API, 1,134 records, filtered to 150 days and classified by subject; all eight links in §16 were downloaded and read, and each returned HTTP 200.
- **Bulk and block deals:** no bulk or block deal in calendar 2026. The most recent per Trendlyne was **24 September 2025** (2,337,376 shares at ₹581.37). The only block-deal headline that resolves for this symbol is from February 2024 and relates to a third party's sale, not to this year. This is a search-based check, not an exhaustive scan of every exchange deal file.
- **Analyst estimates:** Simply Wall St post-results consensus of 6 November 2026 (10 analysts, FY27 revenue ₹79.9 bn, EPS ₹19.38); MarketScreener/Investing.com consensus target ₹808.56 across 8 analysts (high ₹900, low ₹675); Emkay Buy ₹900 (raised from ₹850, 4 November 2026). None is used to derive this note's forward estimates.
- **Risk-free rate:** India 10-year G-sec **7.31%** (Trading Economics, 13 November 2026). The 6.5% figure in the standing playbook is out of date. October CPI printed **6.09%**, above the RBI's 6% tolerance band, with a December hike expected.
- **What is estimated, and labelled as such:** FY27E EPS ₹21.1 and FY28E EPS ₹28.9 are derived here from the H1 run-rate, the guided margin and capex, a 26% tax rate and a 49% share of Flash's PAT. The FY27 revenue of ₹8,200 Cr is my arithmetic, not guidance — the company gives no revenue guidance. The ≤19-month TFT SOP and the 3-4x asset turnover are management statements, not verified.
- **What is not known:** why Screener's P/E and earnings yield disagree; the exact non-controlling interest in VAST and the other 51%-held subsidiaries (the consolidated statement's attributable-profit lines were not legible in the filed PDF); and whether the ₹37 Cr HCMF investment and the two solar SPVs carry any further commitments beyond the disclosed amounts.
