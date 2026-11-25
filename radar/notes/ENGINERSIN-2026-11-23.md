---
title: Engineers India Ltd (ENGINERSIN) — Radar Deep Dive
code: ENGINERSIN
date: 2026-11-23
band: small
industry: Construction — hydrocarbon engineering consultancy and LSTK contracting (CPSE under MoPNG)
status: private research note — not published
price: 296.55
verdict: WATCH — the order book has genuinely inflected (₹20,421 Cr, 75% consultancy) and the balance sheet is fortress-grade, but the quoted 18.6x P/E sits on trailing earnings inflated by a ₹183 Cr post-tax project-closure gain, so the underlying multiple is ~23x; the 11 November all-time-high breakout failed on 23% delivery and price is back 8% below it
data_basis: Screener.in consolidated page (23 Nov 2026 fetch, logged-in 27-metric sidebar, live CMP ₹297; full tables in radar/fundamentals/ENGINERSIN.json), Q2 FY27 consolidated and standalone results filing of 30 Oct 2026 read in full (17 pages incl. balance sheet and cash-flow statement), Q2 FY27 investor presentation of 30 Oct 2026 (24 pages), Q2 FY27 earnings-call transcript of 4 Nov 2026 (19 pages, read in full), NSE corporate-announcements API (20 price-moving filings in 120 days), NSE sec_bhavdata_full daily files for 245 real trading sessions 24 Nov 2025–20 Nov 2026 (holiday/duplicate copies removed by DATE1), NSE corporate actions feed, ICICI Securities Q2 FY27 result update of 2 Nov 2026 (FY27E/FY28E estimates), Tavily news sweep, India 10Y G-sec 7.19% (TradingEconomics, 20 Nov 2026)
---

# Engineers India — Radar Deep Dive

Private note for the multibagger radar. Not published, not deployable, not part of the website. One company, one Screener page (consolidated), paced. Every figure below is read off an exchange filing, computed from the exchange's own bhavcopy, or labelled as an estimate.

**The one-line case.** EIL is the Indian state's engineering brain for refining and petrochemicals — 60 years old, ₹2,119 Cr of cash and deposits, zero debt on ₹3,341 Cr of equity, 30.4% ROCE, and for the first time in a decade an order book that is growing faster than it can execute: **₹20,421 Cr at 30 September 2026, an all-time high and 4.8x FY27 revenue guidance, of which 75% is the high-margin consultancy work that earns 25-31% segment margins.** Profit in Q2 more than doubled on a *falling* top line because the mix swung from 46% to 74% consultancy. What stops this being a buy at ₹296.55 is arithmetic the headline number hides: the trailing P/E of 18.6x is computed on TTM profit of ₹897 Cr that contains roughly **₹183 Cr of post-tax turnkey closure gain booked in Q3 FY26** — strip it and the same price is **~23.3x underlying**, which is a 45% premium to its own six-year median of 16.1x for a business guiding 10-13% revenue growth. The stock is not expensive because it is bad; it is fully priced because it is good.

---

## 1. Quick Snapshot

| Item | Value |
|---|---|
| Price | **₹296.55** (NSE close 20 Nov 2026, −3.56%; previous close ₹307.50) |
| Market cap | **₹16,667 Cr** (56.20 Cr shares of ₹5 face; paid-up equity ₹281.02 Cr) |
| 52-week range | **₹163.55 (27 Jan 2026) to ₹323.65 (11 Nov 2026, all-time high)** — 8.4% below the high, 81.3% above the low |
| P/E trailing | **18.6x** on TTM EPS ₹15.96 (TTM consolidated PAT ₹897 Cr) |
| **P/E on underlying earnings** | **~23.3x** — TTM PAT stripped of the ~₹183 Cr post-tax Q3 FY26 turnkey closure gain gives EPS ₹12.71 (§9a) |
| P/E FY27E / FY28E | **22.8x** (ICICI EPS ₹13.0) / **18.9x** (EPS ₹15.7) |
| P/B | **4.99x** on book value ₹59.45 (consolidated equity ₹3,341 Cr at Sep-26) |
| EV/EBITDA | **18.1x** (EV ₹14,564 Cr ÷ TTM EBITDA ₹803 Cr); 16.2x if the ₹1,586 Cr of strategic investments are also netted |
| ROCE / ROE | **30.4% / 23.4%** (Screener) |
| Debt | **₹16 Cr borrowings** (lease liabilities) against ₹3,341 Cr equity — D/E 0.00 |
| Cash | **₹2,119 Cr** cash + bank deposits + current investments (12.6% of market cap) |
| Dividend | FY26 ₹5.00/share total (₹1.00 + ₹1.50 interim, ₹2.50 final) = **1.69%**; FY27 first interim ₹1.50 declared 30 Oct 2026 |
| Promoter | **GoI 51.32%**, unchanged every quarter since March 2021; no pledge |
| Order book | **₹20,421 Cr** at 30 Sep 2026 (75% consultancy, ~56% overseas); inflow FY27 to date ₹8,100 Cr |
| Employees / scale | ~3,000 employees; 8,000+ assignments, 700+ major projects executed since 1965 |
| Next results | Q3 FY27, late January 2027 (Q3 FY26 was filed 22 Jan 2026) |
| Radar ledger | Added 23 Nov 2026 at ₹296.55, **5 of 7 gates**, band small, score 58.4 (week 2026-W48) |

Performance from weekly exchange closes: **+48.1% over twelve months** (₹200.25 on 14 Nov 2025 to ₹296.55 on 20 Nov 2026) against **Nifty 50 −0.4%**. Six months **+20.2%** against +9.1%. Three months **+21.7%** against +5.9%. One month **+14.1%**. On every horizon the stock is beating the index by 12-90 percentage points — which is exactly the condition under which you stop looking for reasons to buy and start looking for where the entry is.

**Four data warnings before anything else.**

First, **the trailing P/E is not the multiple you think it is.** Screener's TTM window (Dec-25 to Sep-26) includes Q3 FY26, the quarter in which the turnkey segment booked **₹273.7 Cr of segment profit against a ₹25-33 Cr quarterly run-rate**. That is an ₹183 Cr post-tax swing in a ₹897 Cr TTM number. ICICI Securities independently models FY27 PAT at ₹730 Cr — *below* trailing ₹897 Cr — which confirms the trailing figure is a peak, not a run-rate. Every valuation in §9 is shown twice for this reason.

Second, **radar's "CFO/PAT 0.36x" quality gate is a period mismatch.** It divides FY26 operating cash flow of ₹319 Cr by *TTM* PAT of ₹897 Cr. On matched periods it is **0.46x for FY26** (₹319 Cr ÷ ₹692 Cr), and on H1 FY27 it is **2.1x** (₹604.8 Cr standalone CFO ÷ ₹288.4 Cr standalone PAT). The gate fails legitimately even on matched periods, but 0.36x overstates how bad the cash conversion is and should not be repeated.

Third, **Screener's five-year sales CAGR of 5.4% is arithmetically right and economically misleading.** It spans FY21-FY26, a period that begins with a COVID-collapsed order cycle and ends before the current order book existed. The order book went ₹76,549 Cr (Mar-22) → ₹78,235 Cr (Mar-24) → ₹117,173 Cr (Mar-25) → ₹151,093 Cr (Mar-26) → **₹204,205 Cr (Sep-26)**. Revenue follows order book with a two-to-three-year lag in this business; the revenue series has simply not caught up yet.

Fourth, **the standalone and consolidated numbers differ materially and this note mixes them deliberately, with labels.** Consolidated PAT is ₹197 Cr in Q2 against standalone ₹180 Cr because the Ramagundam Fertiliser JV (26% owned, equity-accounted) contributed ₹63 Cr in H1. P&L and valuation use **consolidated** (it is what BSE filings and the investor presentation reconcile to); the cash-flow colour in §4 uses the **standalone** statement because that is the one printed in the filing, and it is labelled every time it appears.

---

## 2. What the Company Does

EIL is a **CPSE under the Ministry of Petroleum & Natural Gas**, set up in 1965 to give India an indigenous engineering capability for refineries. It does two things, and the split between them is the whole investment case.

**Segment one — Consultancy & Engineering (68% of H1 FY27 revenue, ~75% of order book, 25-31% margin).** EIL sells engineering hours and project-management expertise: process design, basic and detailed engineering, PMC/EPCM services, owner's engineer, third-party inspection, safety and environmental studies. The customer supplies the steel and the contractors; EIL supplies the drawings, the specifications and the supervision. Revenue is billed on man-hours and progress milestones, so the marginal cost of an extra project is largely salaries — which is why a 68/32 mix produces 19% operating margin and the reverse mix produces 9%.

**Segment two — LSTK / Turnkey (32% of H1 FY27 revenue, 25% of order book, 4-7% margin).** EIL takes lump-sum responsibility for building the thing — typically depots, terminals, compressor stations, data centres, convention centres — and subcontracts the construction. Revenue includes all the plant and machinery, so margins are thin and the accounting is progress-based. The **"depository" sub-segment** (EIL's term; it behaves like LSTK because materials sit in the top line) earns ~7% and has recently included a ₹1,090 Cr Powergrid data-centre PMC in Chennai and a ₹349.6 Cr Intelligence Bureau office-cum-data-centre change order — both won in Q2 FY27.

**Where the work comes from.** FY26 revenue was ₹3,850 Cr standalone: consult ₹1,782 Cr, turnkey ₹2,068 Cr. The order book at September 2026 is ₹20,421 Cr, split **₹3,894 Cr consultancy-domestic, ₹11,418 Cr consultancy-overseas, ₹5,109 Cr turnkey** — 56% overseas, 44% domestic, and 75% consultancy. Management said on the call that this order book executes over **three to four years** and that the Dangote projects specifically run **four to five**.

**The single most important fact about this company**: it is a **people business with a sovereign balance sheet**. Employee cost was ₹1,040 Cr on ₹3,850 Cr of revenue in FY26 (27%). It carries no debt, holds ₹2,119 Cr of cash and deposits, and **runs negative working capital of −60 days** because clients pay advances before EIL pays anything. That combination — negative WC, zero debt, 30% ROCE — is why the radar's reinvestment and balance gates passed without argument.

**The second most important fact**: its revenue and its order book have been out of phase for a decade. Order book was flat around ₹76,000-78,000 Cr from FY22 to FY24 while revenue drifted between ₹3,300 Cr and ₹3,100 Cr. The order book has since nearly tripled, and revenue has not moved. The whole question in this note is whether the gap closes — and how much of it the market has already paid for.

---

## 3. Why It Cleared the Radar Gates (5 of 7, plus the eighth)

The intake gate runs seven mechanical checks; the eighth — whether a second engine exists — is left to the deep dive as a human read. EIL passed five.

| Gate | Rule | EIL | Result |
|---|---|---|---|
| Headroom | Market cap < ₹25,000 Cr | ₹16,667 Cr | **Pass** |
| Reinvestment | ROCE ≥ 18% | 30.4% | **Pass** |
| Durability | 5y sales CAGR ≥15% and margin stable | **5.4%** CAGR; margin stable (9% → 18%) | **Fail** |
| Quality | CFO/PAT ≥0.8x and debtors ≤90d | **CFO/PAT 0.36x** (0.46x matched), debtors 44.5d | **Fail** |
| Balance | Debt/equity ≤0.5 | 0.00 | **Pass** |
| Management | Promoter ≥35% and stable | GoI 51.32%, flat since Mar-21 | **Pass** |
| Valuation | P/E ≤1.5× industry or ≤35x | 18.6x vs industry 14.0x (limit 21.0x) | **Pass** |

**Why the two fails did not disqualify it, and what they actually mean.**

*Durability fail — real, but the wrong window.* A 5.4% five-year sales CAGR is a fact. It is also the CAGR of a company whose revenue fell in FY21 (−3%), FY22 (−7%) and FY25 (−6%) for reasons that had nothing to do with competitiveness: COVID-delayed refinery capex, then the completion of the big-ticket turnkey projects that had nothing to replace them. The order book has gone from ₹76,549 Cr to ₹204,205 Cr in four and a half years. The gate measures the past; the thesis is about whether the order book converts. That is the thing this note has to test, so §5 and §6 test it.

*Quality fail — the most interesting number in the file.* FY26 operating cash flow of ₹319 Cr against FY26 PAT of ₹692 Cr is 0.46x — genuinely weak, and the reason is visible in the balance sheet: receivables rose, provisions for contractual obligations moved, and the turnkey work consumed cash. But H1 FY27 flipped it hard: **standalone cash generated from operations ₹705.5 Cr, net CFO after tax ₹604.8 Cr, against PAT of ₹288.4 Cr — 2.1x.** The driver was a ₹548 Cr increase in trade and other payables, i.e. client advances on the new orders (Dangote Kenya, Powergrid, IB). That is real money in the bank, but it is *advance* money: it reverses into revenue as the work is executed, and it will not repeat at this scale. Read correctly: the cash conversion problem is cyclical and currently improving, not structural — but the H1 number is flattered and should not be annualised.

*The eighth gate — a second engine.* EIL's second engine is explicitly the overseas PMC franchise, and it is no longer hypothetical: **56% of the order book is overseas**, Dangote has now hired EIL three times (Nigeria refinery PMC/EPCM at 650,000 bpd and its expansion to 1.4 mn bpd, a ₹287 Cr LAB-complex change order, a ₹286 Cr Ethiopia fertiliser PMC, and now the ₹4,409 Cr Kenya refinery), and ADNOC Offshore awarded a ₹482 Cr PMC for Umm Shaif in Q2. The franchise is proven outside India. What is **not** proven is that it is a *second* engine rather than a *substitute* engine: Saudi and the wider Middle East are frozen ("the situation is not all right in the Middle East… in Saudi we are still waiting because the attacks are still there"), and overseas consultancy is now 68% of the overseas order book. Concentration replaced diversification. Marked **partial pass**.

---

## 4. Three Years of Accounts (consolidated, Screener)

| ₹ Cr | FY24 | FY25 | FY26 | TTM (Sep-26) |
|---|---|---|---|---|
| Sales | 3,281 | 3,088 | 3,928 | 3,781 |
| Sales growth | −1% | −6% | +27% | +6% |
| Operating profit | 299 | 514 | 699 | 803 |
| OPM | 9% | 17% | 18% | 21% |
| Other income | 219 | 268 | 242 | **370** |
| Depreciation | 35 | 40 | 42 | 41 |
| PBT | 478 | 738 | 894 | 1,130 |
| PAT | 445 | 580 | 692 | 897 |
| EPS (₹) | 7.92 | 10.32 | 12.30 | 15.96 |
| Dividend payout | 38% | 39% | 41% | — |

**Three things in that table matter.**

**One: the margin is the story, not the revenue.** Operating margin went 9% → 17% → 18% → 21% while revenue went sideways, then up 27%, then sideways again. That is not operating leverage from volume; it is **mix**. The FY26 jump to 18% came with revenue up 27% and the turnkey segment booking ₹356 Cr of segment profit at 17% (against ₹105 Cr at 8% in FY25) — the completion of legacy LSTK jobs at better-than-expected cost. The TTM 21% comes from consultancy at 68% of revenue. Both are real, but only the second is repeatable, and management itself guides consultancy segment margin back to **25% from the 30-31% just delivered** — a 5-6pp give-back they are openly forecasting.

**Two: other income is a fifth of the P&L, and it is not a trick.** TTM other income is ₹370 Cr against PAT of ₹897 Cr — **41% of profit, 33% of PBT** — and Screener flags it as a CON. The composition, from the Q2 call: ₹21 Cr dividend from Numaligarh Refinery, ₹11 Cr from Certification Engineers International, the rest interest on ₹2,119 Cr of deposits, rental income and mutual-fund gains. **This is not mark-to-market on a venture portfolio; it is treasury income and dividends from strategic stakes, and it recurs.** But it does mean the operating business is smaller than the headline: **core PAT (PAT − other income) is ₹527 Cr, giving a core P/E of 31.6x.** Both numbers are true; neither alone is honest.

**Three: cash flow has been the weak link, and the fix is borrowed from the future.** CFO: ₹222 Cr (FY24) → ₹117 Cr (FY25) → ₹319 Cr (FY26); FCF ₹188 Cr → ₹76 Cr → ₹252 Cr. Never negative — which is why the radar's four-tier calibration does *not* apply a Critical FCF flag here — but never comfortable either. CFO/EBITDA of 93% → 48% → 70% shows the swings. Debtor days improved from 53 to 44.5. The negative working-capital model (−60 days, down from −101 in FY25, i.e. *less* negative) is the structural reason this company can survive weak conversion indefinitely without debt.

**Balance sheet, 30 Sep 2026 (consolidated, from the results filing):** equity ₹3,341 Cr; borrowings ₹16 Cr; cash ₹118.76 Cr + bank deposits ₹1,879.86 Cr + current investments ₹120.67 Cr; trade receivables ₹526.3 Cr; strategic investments ₹1,586 Cr (₹561.7 Cr equity-accounted + ₹1,024.1 Cr at cost — chiefly the 4.37% Numaligarh Refinery stake worth ₹838 Cr and 26% of Ramagundam Fertiliser at ₹491 Cr); total assets ₹6,645 Cr. A note of caution on the deposits: some of that ₹1,880 Cr is likely lien-marked against performance bank guarantees for overseas PMC contracts, so the *free* cash is lower than the gross figure. The company does not disclose the split.

---

## 5. The Last Two Quarters (consolidated)

| ₹ Cr | Q2 FY26 | Q1 FY27 | **Q2 FY27** | YoY | QoQ |
|---|---|---|---|---|---|
| Sales | 921 | 820 | **824** | **−10.5%** | +0.5% |
| Consultancy / Turnkey mix | 46 / 54 | 62 / 38 | **74 / 26** | — | — |
| Operating profit | 120 | 126 | **173** | +44.4% | +37% |
| OPM | 13.0% | 15% | **21.0%** | +797 bps | +600 bps |
| Other income | 37 | 81 | **87** | +135% | +7% |
| PBT | 120 | 197 | **249** | +108% | +26% |
| PAT | 83.5 | 158 | **197** | **+135.6%** | +25% |
| EPS (₹) | 1.49 | 2.81 | **3.50** | — | — |

**Q2 FY27 is the most informative quarter this company has reported in years, and it is informative precisely because revenue fell.** Sales down 10.5% and profit up 135% is only possible through mix: consultancy revenue went ₹411 Cr → ₹594 Cr (+45% YoY) while turnkey went ₹489 Cr → ₹208 Cr (−57%). The consultancy segment earned **₹183.6 Cr on ₹594.4 Cr (30.9%)**; the turnkey segment earned **₹9.0 Cr on ₹208.0 Cr (4.3%)**.

**Two checks on whether that margin is real.** First, the analysts asked twice — ICICI's Mohit Kumar and Prescient's Anubhav Mukherjee both pressed on whether there was a one-off or a past-period settlement in the 30% consultancy margin. Management's answer, twice: *"this quarter, there is no onetime item… It is from the regular business."* Second, the model itself: H1 consultancy margin is 27.7%, management guides 25% for the full year and says only that it will be "higher than 25%". **Take them at their word: 25% is the number to model, 30% is the quarter to remember, and anyone using 30% in a forecast is 5pp too high.**

**Q1 FY27 for completeness:** revenue ₹820 Cr (−6% YoY), OPM 15%, PAT ₹158 Cr (+52% YoY), consultancy ₹499 Cr at 24%, turnkey ₹302 Cr at 7.5%. The sequential step-up in margin from Q1 to Q2 is the mix, not pricing.

**What management said about the forward numbers (30 Oct call, verbatim where quoted):**
- FY27 revenue guidance **₹4,200-4,300 Cr**; FY28 **"around 10%" growth**.
- Order inflow FY27 guidance was ₹8,000 Cr; **already ₹8,100 Cr by the call date**; FY28 "at least ₹8,100 Cr".
- Consultancy margin: **"we will maintain 25%"**, "definitely higher than 25%", "I cannot commit it will be 30%".
- LSTK revenue mix to rise from 32% in H1 to **"at least 40%"** in H2 as new projects ramp.
- EBITDA margin guidance **15-16%** reiterated (Q2 delivered 21% — the guide is conservative or stale; note that it has not been raised).
- Other income to keep running: *"We are receiving dividend on a continuous basis from NRL and CEIL."*

**The one number in that list that does not reconcile comfortably.** H1 revenue was ₹1,603 Cr. To hit ₹4,200 Cr, H2 must deliver **₹2,597 Cr — 24.1% above H2 FY26's ₹2,092 Cr**; to hit ₹4,300 Cr it needs **₹2,697 Cr, +28.9%** — in a year whose second quarter just printed **−10.5% YoY revenue**. Management explains it as LSTK ramp (32% → 40%) plus Dangote momentum, and H2 is seasonally the stronger half for this business (FY26: H1 ₹1,758 Cr, H2 ₹2,092 Cr). It is possible. It is not yet visible. **This is the single line item the Q3 result will settle.**

---

## 6. Shareholding — the quiet re-rating

| % | Mar-24 | Mar-25 | Mar-26 | Jun-26 | **Sep-26** | 6-month change |
|---|---|---|---|---|---|---|
| Promoter (GoI) | 51.32 | 51.32 | 51.32 | 51.32 | **51.32** | 0.00 |
| FII | 7.01 | 6.75 | 9.66 | 9.20 | **8.09** | **−1.57 pp** |
| DII | 13.60 | 10.76 | 12.19 | 14.20 | **16.61** | **+4.42 pp** |
| Government | 0.01 | 0.01 | 0.04 | 0.04 | 0.04 | 0.00 |
| Public | 28.05 | 31.14 | 26.79 | 25.25 | **23.94** | −2.85 pp |
| Shareholders (lakh) | 3.86 | 4.85 | 4.22 | — | **3.83** | −0.39 |

*(Column labels are 31 March fiscal year-ends and 30 June / 30 September quarter-ends, per the filings — not calendar year-ends.)*

**This is the cleanest institutional signal in the file.** DIIs added **4.42 percentage points in six months** — worth roughly ₹737 Cr at today's market cap — taking domestic institutions from 12.19% to 16.61%, while FIIs trimmed 1.57pp (₹262 Cr). Public holding fell 2.85pp and the shareholder count dropped from 4.85 lakh (Mar-25 peak) to **3.83 lakh**, a 21% decline, *while the stock rose 48%*. Fewer holders, higher price, more institutional ownership is the definition of a retail-to-institution transfer: weak hands exited into strength and domestic funds absorbed them. Note the asymmetry with the usual pattern (FIIs out, DIIs in) — here DIIs did not merely absorb FII selling, they added **2.8x** what the FIIs sold.

**Governance footnote, and it is a footnote.** NSE and BSE each fined the company **₹5,36,900** (25 Aug 2026) for non-compliance with Regulation 17(1) for the June-2026 quarter — too few independent directors, including no woman independent director. EIL's response (28 Oct 2026) is the standard CPSE defence: the power to appoint directors rests with the GoI, MoPNG has been asked to fill the vacancies, and the fines were appealed. One independent director (Ashish Kumar Gupta) was appointed 14 Aug 2026. This is a structural feature of every PSU — the board is the ministry's to fill — not a management failure, and the financial impact is immaterial (₹10.7 lakh combined). It matters only as a reminder that EIL's strategic direction can be redirected by the state without notice.

---

## 7. Delivery and Price Structure

Computed from **NSE sec_bhavdata_full** for 245 real trading sessions (24 Nov 2025 – 20 Nov 2026), duplicate/holiday files removed by DATE1, last day excluded from every average.

| Date | Close ₹ | Volume | Delivery % | Note |
|---|---|---|---|---|
| 09 Nov | 299.35 | 19.9 L | 37.2 | |
| 11 Nov | 311.20 | **1.24 Cr** | **23.3** | All-time high ₹323.65 intraday, +8%; **4.8x** the prior-30-session average volume, on **23% delivery** |
| 12 Nov | 307.55 | 32.3 L | 40.4 | |
| 13 Nov | 312.45 | 29.4 L | 40.1 | |
| 16 Nov | 312.05 | 20.9 L | 40.3 | |
| 17 Nov | 312.90 | 56.9 L | 31.5 | Second volume spike, 10.5x the 20-day average |
| 18 Nov | 304.70 | 32.9 L | 38.5 | |
| 19 Nov | 307.50 | 14.9 L | 27.3 | |
| 20 Nov | **296.55** | 17.8 L | 39.8 | −3.56%, lowest close in seven sessions |

**Delivery statistics: 15-session average 33.2%, 30-session average 35.9%, maximum in 30 sessions 48.4%, only 2 of 30 sessions above 45%.** The NSE large-cap baseline is roughly 37%. So delivery is *slightly below normal*, and — this is the part that matters — **on the single biggest volume day of the year, delivery was 23.3%.** Twelve million shares traded and fewer than three million were taken home. That is not accumulation; that is churn, and it happened on the day the stock printed its all-time high.

**The pattern, read honestly.** EIL bottomed at **₹163.55 on 27 January 2026**, rallied through the year, hit **₹323.65 on 11 November** — a new all-time high, +98% from the low — and then gave back 8.4% in seven sessions to ₹296.55. The ATH breakout had the volume (4.8x) but not the delivery (23.3%). The subsequent decline came on *falling* volume (1.5-3.3 million shares) with delivery back at 38-40%, which is the signature of supply drying up rather than distribution — but it also means the breakout has failed on its own terms.

**Where the levels are.** Pivot from the 20 Nov bar: **P 298.82, R1 302.73, R2 308.92, S1 292.63, S2 288.72.** Moving averages: EMA9 302.8, EMA20 295.3, EMA50 284.1, EMA100 269.8, EMA200 250.4. ATR(14) ₹14.78 = **4.98% of price** — the close is ₹1.21 above the 20-day EMA, i.e. **0.08 ATR**, so the stock is sitting in the exact middle of its own noise band with no directional edge. The 60-session range is ₹236.75–₹323.65 (37% wide), and the recent support shelf that has held four times is **₹292-296**; below that, the 50-day EMA at **₹284** and the 23 October swing low at **₹237**.

**Volume and liquidity.** Average daily volume 5.4 million shares ≈ **₹160 Cr of daily turnover** — liquid enough for any retail or small-fund position. Relative strength is strong on every window (1y +48% vs Nifty −0.4%).

---

## 8. The 25-Point Swing Checklist

Run in full. Scoring rule: Pass = 1, Caution = 0.5, Fail = 0, N/A excluded. **Score 20.5 of 25.** The score reconciles as **17 Pass + 7 Caution + 1 Fail = 17 + 3.5 = 20.5**.

**1. Price position — Pass.** 8.4% below an all-time high set eight sessions ago. This is the ideal zone by the checklist's own rule (within 25% of the high, ideally at ATH).

**2. Trend — Pass.** Higher highs and higher lows unbroken since the 27 January low: ₹163.55 → 236.75 (23 Oct) → 323.65 (11 Nov). Price is above the 20, 50, 100 and 200 EMAs.

**3. Volume characteristics — Caution.** Volume quality is the weak link. Average volume is flat-to-declining (20-day 5.41 mn, 50-day 5.51 mn) and the expansion that did arrive on 11 November came with 23.3% delivery. High volume *expansion* without delivery is not institutional participation.

**4. Clean price action — Caution.** A 4.98% ADR means the chart is not orderly: the last eight sessions include +1.6%, −1.2%, −0.1%, +0.3%, −2.6%, +0.9%, −3.6%. Tradable, not clean.

**5. EMA alignment — Caution.** The stack is correct and rising — EMA9 302.8 > EMA20 295.3 > EMA50 284.1 > EMA200 250.4 — but **price is below the 9 EMA** and only 0.4% above the 20 EMA. Perfect alignment, price on the wrong side of the shortest average.

**6. Chart pattern and base — Caution.** There is no textbook base. What exists is a V-shaped recovery off ₹163.55 followed by a seven-month ascending range. The checklist's practical nuance (long-duration deep patterns can be valid) does not rescue it because the pattern is neither a clean cup nor a tight base — it is a trend with a wide range.

**7. Base quality — Caution.** Range width is 37% (₹236.75-₹323.65) over 60 sessions, and consolidation has not tightened into the high. Accumulation is inferred from DII buying, not from the tape.

**8. ADR — Caution.** 4.98% daily range. Fine for a swing trader who sizes accordingly; too wide for tight stops. Any stop inside one ATR is noise.

**9. Primary uptrend — Pass.** Above a rising 200 EMA, +48% over twelve months against a flat index. The dominant trend is up.

**10. One trading model — Pass.** The setup is a defined one: post-breakout pullback in an established uptrend. No improvisation needed.

**11. Sector strength — Pass.** Capital goods and construction are the leading cohort in the radar's own weekly screen: six-month relative strength of +27% to +58% across CPPLUS, GRWRHITECH, SHYAMMETL, ASAHIINDIA and JYOTICNC. EIL's +20.2% is mid-pack in a strong sector.

**12. Tailwind — Pass.** Genuine multi-year policy tailwinds: refinery and petrochemical capex, ₹34,000 Cr of VGF for coal gasification, strategic petroleum reserves expansion, nuclear BOP, data centres, and an energy-security imperative pushing refinery construction into Africa.

**13. IPO consideration — Pass / not applicable.** Listed since 1965; no IPO base, no lock-in, no price-discovery distortion, no promoter selling.

**14. Price action strength vs peers — Pass.** +20.2% over six months against Nifty +9.1%, and against RITES (its closest PSU consultancy comparable) which is down on a 12% profit decline. The stock is outperforming its own peer group, not just the index.

**15. Sector and government boost — Pass.** Majority state-owned, MoPNG-administered, Navratna. The government is simultaneously the owner, the customer channel and the policy author. (Counterweight: the same relationship produced the Reg-17 board-composition fine.)

**16. Fundamental quality — Pass.** ROCE 30.4%, ROE 23.4%, zero debt, ₹2,119 Cr of cash and deposits, negative 60-day working capital, Piotroski 8. The offset — other income at 41% of PAT — is disclosed here and priced in §9, not ignored.

**17. Quarterly earnings growth — Pass.** PAT +135.6% YoY in Q2, +56% in H1, on a 10.5% revenue *decline*. The growth is real and it is mix-driven; the checklist asks for 30-50% growth and this exceeds it on the bottom line while failing it on the top line. Noted as a mixed pass.

**18. Delivery percentage — Caution.** 15-session average 33.2%, 30-session 35.9%, two sessions above 45% in 30. Institutional-grade accumulation would show 45%+ averages; this does not.

**19. News and institutional activity — Pass.** Order book at ATH, ₹4,409 Cr Dangote Kenya award, ₹1,090 Cr Powergrid data centre, DII +4.42pp. Negative items (exchange fine, Kenya litigation risk, Middle East freeze) are all in §5 and §11 — none of them is a reason the *tape* is wrong.

**20. Risk management — Pass.** Levels are definable and defined: entry triggers, stop and targets in §9c, all derived from ATR, EMA and pivot, not from hope.

**21. Market environment — Pass.** Nifty +9.1% over six months and +5.9% over three, in an uptrend. Longs are aligned with the tape.

**22. Liquidity — Pass.** ₹160 Cr average daily turnover.

**23. Relative strength — Pass.** Beating the benchmark on 1-month (+14.1% vs index), 3-month (+21.7% vs +5.9%), 6-month (+20.2% vs +9.1%) and 12-month (+48.1% vs −0.4%) windows. This is the strongest single category for EIL.

**24. Breakout confirmation — FAIL.** The one critical fail, and it is disqualifying on its own. The all-time-high breakout of 11 November came on 4.8x volume but **23.3% delivery**, and price has since fallen **8.4% back below the breakout level**. By the checklist's own standard — "wait for a decisive breakout with convincing volume, avoid premature entries" — this breakout is not confirmed. It is a failed attempt until proven otherwise.

**25. Trading psychology — Pass.** The thesis is clear enough to hold through noise and the levels are objective. The risk here is the opposite of confusion: it is FOMO on a stock that is up 48% in a year and just printed an ATH.

**Verdict on the checklist: 20.5/25 — "moderate, needs a catalyst for entry", with a critical fail on breakout confirmation (item 24).** Per the checklist's own rule (no critical fails on items 1, 2, 6, 20, 24 for entry), **this is not an entry today** even though the score is respectable. The score says the *setup* is decent; the critical fail says the *trigger* has not fired.

---

## 9. Valuation

### 9a. The multiple depends entirely on which earnings you use

| Basis | PAT ₹ Cr | EPS ₹ | P/E at ₹296.55 |
|---|---|---|---|
| TTM as reported (Screener) | 897 | 15.96 | **18.6x** |
| **TTM stripped of Q3 FY26 turnkey closure gain** | **714** | **12.71** | **23.3x** |
| FY27E (ICICI Securities, 2 Nov 2026) | 730 | 13.0 | **22.8x** |
| FY28E (ICICI Securities) | 880 | 15.7 | **18.9x** |
| Core PAT (PAT − other income ₹370 Cr) | 527 | 9.37 | **31.6x** |

The Q3 FY26 adjustment is derived, not assumed: the investor presentation's segment table shows turnkey segment profit of **₹273.7 Cr in Q3 FY26** against ₹24.3 Cr (Q2 FY26), ₹25.0 Cr (Q1 FY26) and ₹33.1 Cr (Q4 FY26) — an excess of ₹243.7 Cr pre-tax over a normal quarter, ₹182.8 Cr post-tax at 25%. Removing it from TTM leaves ₹714 Cr and EPS ₹12.71. ICICI's own FY27 estimate of ₹730 Cr is within 2% of that figure, which is independent corroboration that the ₹897 Cr TTM is a peak.

**So the honest statement is: EIL trades at ~23x underlying trailing earnings, 22.8x FY27E and 18.9x FY28E — not 18.6x.** The market's quoted multiple understates the price by about 25%.

### 9b. Against its own history and its industry

P/E at each fiscal year-end, using that year's consolidated EPS and the nearest weekly exchange close:

| Year-end | Close ₹ | EPS ₹ | P/E |
|---|---|---|---|
| Mar-21 | 73.70 | 4.43 | 16.6x |
| Mar-22 | 64.55 | 2.48 | 26.0x |
| Mar-23 | 74.45 | 6.16 | 12.1x |
| Mar-24 | 196.55 | 7.92 | 24.8x |
| Mar-25 | 160.58 | 10.32 | 15.6x |
| Mar-26 | 189.73 | 12.30 | 15.4x |
| **Now** | **296.55** | **15.96 stated / 12.71 underlying** | **18.6x / 23.3x** |

Six-year median **16.1x**, range 12.1x-26.0x. On stated earnings EIL is 15% above its median; on underlying earnings it is **45% above it and at the top of the range bar the FY22 anomaly** (FY22's 26x is an artefact of a collapsed ₹140 Cr profit year, not a genuine multiple).

Peers (Screener live table, 20 Nov 2026 closes):

| Company | CMP ₹ | P/E | ROCE | Div yld | Qtr PAT var | Qtr sales var |
|---|---|---|---|---|---|---|
| Larsen & Toubro | 4,209.10 | 30.7x | 14.6% | 0.90% | +32.5% | +15.8% |
| Rail Vikas Nigam | 191.00 | 43.4x | 10.8% | 0.90% | +8.3% | −8.2% |
| Cemindia Projects | 1,415.90 | 41.8x | 32.8% | 0.21% | +21.3% | +25.2% |
| Kalpataru Projects | 1,325.60 | 19.5x | 18.3% | 0.83% | +20.4% | +7.3% |
| NBCC | 79.60 | 29.2x | 29.3% | 1.26% | +34.5% | +16.5% |
| **RITES** | **187.02** | **22.2x** | **23.1%** | **4.25%** | **−12.3%** | **+1.5%** |
| **Engineers India** | **296.55** | **18.6x** | **30.4%** | **1.69%** | **+135.6%** | **−10.5%** |
| *Construction median (124 cos)* | 114.66 | 13.9x | 16.0% | 0.0% | +21.5% | +19.3% |

**The ROCE-vs-P/E test passes here, unusually.** EIL has the highest ROCE in the table (30.4%) at the second-lowest P/E (18.6x). On stated earnings this is the only name in the group generating 30%+ returns on capital at a sub-20x multiple. NBCC has the same ROCE profile at 29.2x; RITES has 23.1% ROCE at 22.2x. There is no value-destruction signal — the opposite. **But the peer comparison also shows what the 18.6x is buying: the entire group is on a revenue-decline quarter except EIL's profit line, and the median construction company prints 19-25% sales growth at 13.9x.** EIL's revenue is shrinking while its multiple is above median. That is the tension in one line.

Industry P/E is 14.0x. EIL at 18.6x stated (23.3x underlying) is a 33-66% premium to its industry. The premium is defensible on ROCE and order book; it is not cheap.

### 9c. Howard Marks — four methods, no hybrids

| Test | Calculation | Result |
|---|---|---|
| **1. Earnings yield vs risk-free** | 5.38% stated (1/18.6); **4.29% underlying**; 3.16% core vs **7.19%** India 10Y G-sec | **FAIL** — even on stated earnings the equity yields 181 bps less than the sovereign |
| **2. PEG < 1.0** | 18.57 ÷ 25.6% (Screener 3Y profit CAGR) = **0.73** | **PASS** |
| **3. Margin of safety on book** | Price ₹296.55 vs book ₹59.45 = **5.0x book**, MoS −399% | **FAIL** — no liquidation floor; correct for an asset-light consultancy, where book value is not the right floor either |
| **4. Earnings power value** | Normalised EPS ₹13.0 ÷ 12% = **EPV ₹108**/share; price/EPV **2.74x** (2.42x ex-cash) | **FAIL** — above the 2x "reasonable for growth" threshold |
| **5. ROCE > cost of capital** | 30.4% vs ~12% | **PASS** |

**Composite: 2 of 5 — Conditional.** Not deep value, not a trap. The stock fails every absolute-value test and passes both quality tests (PEG, ROCE). That is the signature of a good business at a full price, and the correct response is a price trigger rather than a rating.

### 9d. What the market is being asked to believe

At 23.3x underlying, with ICICI's 13.7% revenue and 17.4% PAT CAGR over FY26-FY28E, the forward PEG is roughly **1.3x** — acceptable, not compelling. The bull arithmetic requires the order book to convert faster than it has in any year since 2019: ₹20,421 Cr at 4.8x FY27 revenue, with management guiding FY28 revenue growth of only ~10% (≈₹4,700 Cr). **Even on management's own numbers, revenue grows 11% while the order book is 5x revenue — which means the order book is not the constraint, execution capacity is.** EIL has ~3,000 employees and has grown revenue at 5% for five years; the multiple is paying for a step-change in throughput that no guidance line commits to.

ICICI's ₹360 target is 22.9x FY28E EPS — i.e. exactly today's underlying multiple applied to earnings two years out. That is a coherent target and it implies 21.4% upside; it also shows the analyst is not assuming any re-rating, only earnings growth. Fair.

---

## 10. The Bull Case

**1. The order book inflection is real, recent, and consultancy-heavy.** ₹20,421 Cr at 30 Sep 2026 against ₹13,131 Cr a year earlier and ₹14,424 Cr a quarter earlier — **+55.5% year-on-year and +41.6% in three months**, at 75% consultancy versus 59% a year ago. Inflow for FY27 is already ₹8,100 Cr, above the full-year ₹8,000 Cr guidance, with two months of the year still to bid. The only year in the last decade with comparable growth was FY25 (+50%), and that was off a much smaller base (₹78,235 Cr → ₹117,173 Cr).

**2. Margin mix is structurally improving, not cyclically.** Consultancy went from 47% of H1 FY26 revenue to 68% of H1 FY27. Every percentage point of revenue shifted from turnkey (~5%) to consultancy (~27%) is worth roughly **₹8 Cr of annual operating profit** on ₹3,800 Cr of revenue — and the shift is driven by which contracts EIL is winning, not by commodity prices or a cycle. Management's own 25% floor for consultancy margin is a conservative anchor.

**3. The balance sheet is a strategic asset in a downturn.** ₹2,119 Cr of cash and deposits, zero debt, negative working capital. EIL can bid on a $450 mn PMC without a financing constraint, can absorb a bad contract without distress, and pays a dividend (39-41% payout) while doing it. In a sector where peers carry 0.2-0.9x debt/equity, this is a genuine differentiator.

**4. Overseas is a proven, repeatable franchise, not a one-off.** Dangote has hired EIL four times across three countries. ADNOC Offshore awarded Umm Shaif in Q2. EIL ran the PMC on the world's largest single-train refinery and is now on its expansion. That is a reference list no Indian competitor can match, and it is being monetised at consultancy margins.

**5. Domestic policy pipeline is unusually deep.** Coal gasification (₹34,000 Cr VGF), strategic petroleum reserves (ISPRL's Bina and new sites), the AP refinery, Paradip Phase 2, nuclear BOP and environmental work, data centres (Powergrid, IB), fertilisers, non-ferrous smelters. None of these is in the order book; several are directly in EIL's technical lane; the nuclear opportunity alone is described by management as "a year or so" away.

**6. Institutional ownership is being rebuilt, not distributed.** DIIs +4.42pp in six months while public float and shareholder count fell. Domestic funds are buying a PSU consultancy at 23x — they are not doing that for the dividend.

---

## 11. The Bear Case

**1. The valuation is 25% higher than the quoted number.** 18.6x is computed on earnings that include a ₹183 Cr post-tax closure gain. On underlying earnings it is 23.3x; on FY27E 22.8x; on core earnings ex-other-income 31.6x. Nothing about the business is wrong — the price is simply being discussed on a flattering denominator, and if the market re-anchors on FY27 numbers the same earnings support a much lower price.

**2. Revenue is falling while the order book is at a record.** Q2 revenue −10.5% YoY, H1 −8.8%. To hit guidance, H2 must grow 24-29% YoY in a business that has grown 5% a year for five years. Management has never explained the mechanism beyond "LSTK will go to 40% of revenue" — and LSTK at 4-5% margin adds revenue without adding much profit.

**3. Fifteen percent of the order book is one client, and that client is in court.** Dangote group exposure across Kenya (₹4,408.6 Cr), Nigeria LAB (₹287.2 Cr) and Ethiopia fertiliser (₹286.0 Cr) is **₹4,982 Cr, or 24.4% of the order book.** The Kenya refinery is subject to litigation that management acknowledges ("the ongoing court case in Kenya around the proposed refinery project") and dismisses as the owner's problem. It is the owner's legal problem and EIL's revenue problem if the project stalls.

**4. Other income is 41% of profit, and the core business is on 31.6x.** Treasury income and JV dividends are real cash, but they are not engineering. Strip them and the operating business earns ₹527 Cr for a ₹16,667 Cr market cap.

**5. The Middle East franchise is frozen.** Saudi is described as unsafe with attacks ongoing and no major orders expected near term; only ₹500-600 Cr of the ₹8,100 Cr FY27 inflow came from the region. EIL's largest historical PMC market is contributing almost nothing, and the replacement (Africa) is *less* diversified, not more.

**6. Cash conversion is still lumpy and H1's strength is an advance.** CFO/EBITDA has run 93% → 48% → 70% across three years. The 2.1x H1 FY27 conversion is built on a ₹548 Cr increase in payables from client advances — money that will be consumed as revenue, not repeated.

**7. Zero pricing power on the margin guide.** Management is guiding consultancy margin *down* to 25% from the 30-31% just delivered, and EBITDA margin guidance of 15-16% has not been raised despite Q2's 21%. Either the guide is stale (which raises credibility questions) or management expects the mix benefit to fade (which caps the earnings upgrade cycle).

---

## 12. Risk Calibration

| Risk | Severity | Reasoning |
|---|---|---|
| **Client concentration — Dangote 24.4% of order book, Kenya project in litigation** | 🔴 **High** | A single counterparty group carries a quarter of revenue visibility, and one of its three projects faces a court challenge EIL cannot control. Not Critical because the contracts are progress-billed and the owner is creditworthy. |
| **Revenue guidance delivery — H2 needs +24-29% YoY** | 🔴 **High** | Guidance requires the largest half-year in the company's history, after two quarters of decline. A miss is the most likely single negative catalyst. |
| **Multiple compression — 23.3x underlying vs 16.1x six-year median** | 🔴 **High** | At 30% growth a 23x multiple is fine; at 11% guided growth it needs to come down or earnings must beat. This is the main source of downside, not the business. |
| Valuation dependence on other income (41% of PAT) | ⚠️ Medium | Structural and cash-backed (NRL/CEIL dividends + treasury interest) but sensitive to rates and to NRL's own payouts. |
| Consultancy margin mean-reversion (31% → 25% guided) | ⚠️ Medium | Management has pre-announced the give-back; a sub-25% print would break the mix thesis. |
| Middle East / Saudi market closure | ⚠️ Medium | Removes the historically largest PMC market; Africa substitution is working but is a single client. |
| Lumpy turnkey segment profit | ⚠️ Medium | Q3 FY26 ₹273.7 Cr vs Q4 ₹33.1 Cr — closure gains create 2-3x swings in quarterly profit. |
| CPSE pay revision pending | ⚠️ Medium | Employee cost is 27% of revenue and there is currently no pay commission constituted. A large retrospective revision is an unmodelled margin hit. |
| Board composition non-compliance / exchange fines | 🟢 Low | ₹10.7 lakh combined; caused by GoI appointment delays; one independent director added Aug-26; appealed. |
| Auditor change | 🟢 Low | CAG appointment of S C V & Co LLP for FY27 under s.139 — routine PSU rotation, not a resignation. |
| New segments (nuclear, green H2, coal gasification) | 🟢 Low | No capital committed, no revenue assumed. Optionality, not exposure. |
| FCF / working capital distress | 🟢 Low | FCF positive three years running (₹188/76/252 Cr), WC −60 days, zero debt. |
| Institutional exodus | 🟢 Low | DIIs added 4.42pp in six months; FII selling of 1.57pp was absorbed 2.8x over. |

**No Critical-severity risk is present.** Negative FCF, working-capital blow-up and institutional exodus — the three things that make these notes say "Critical" — are all absent. The risks here are price and execution, not survival.

---

## 13. Kill Criteria

The thesis dies if any of these happens. Each is observable within two quarters.

1. **FY27 revenue comes in below ₹3,900 Cr** (against guidance of ₹4,200-4,300 Cr). A sub-4% miss is tolerable; a 7%+ miss with no explanation ends the "order book converts" argument, because it would mean a record ₹20,421 Cr book produced a shrinking top line for a second consecutive year.
2. **The Dangote Kenya refinery is cancelled, suspended, or EIL's scope is rescinded** — whether by the Kenyan court, by financing failure, or by the owner. This removes ₹4,409 Cr (21.6%) of the order book and, more importantly, breaks the "repeatable overseas franchise" claim.
3. **Consultancy segment margin prints below 22% for two consecutive quarters.** That would mean the 30% Q2 was a peak-of-cycle mix artefact rather than a structural shift, and the entire margin-expansion leg of the thesis fails.
4. **FY28 order inflow guidance drops below ₹8,000 Cr**, or the order book falls below ₹18,000 Cr at any quarter-end. An order book that stops growing while revenue is still 5x below it means EIL is winning work only as fast as it executes — which is a mature business, not an inflecting one.
5. **DII holding falls below 12% (from 16.61%) over two quarters** without a corresponding FII increase. That would reverse the single cleanest accumulation signal in the file.

---

## 14. What Would Change the View

| Event | Impact on thesis |
|---|---|
| **Q3 FY27 revenue above ₹1,150 Cr** (vs ₹926 Cr in Q3 FY26) | Bullish — puts ₹4,200 Cr guidance in reach and confirms LSTK ramp; triggers an entry review |
| **Decisive close above ₹324 on delivery >40%** | Bullish — the failed 11 Nov breakout gets a second, confirmed attempt; this is the technical entry trigger |
| **Pullback to ₹284-292 on delivery ≥35%** that holds the 50 EMA | Bullish — better risk/reward than chasing; 4.2x ATR of upside to the ATH |
| **FY28 revenue guidance above 15%** (vs ~10% now) | Bullish — proves order book conversion is accelerating; justifies a 23x multiple |
| Second large overseas PMC (new client, not Dangote) | Bullish — turns "second engine" from claim into fact; de-risks concentration |
| Middle East reopens / any Aramco award | Bullish — restores the historical franchise and diversifies away from one African client |
| **FY27 revenue below ₹3,900 Cr** | Bearish — kill criterion 1; the order book is not converting |
| **Kenya refinery shelved or scope withdrawn** | Bearish — kill criterion 2; removes 21.6% of the book and the franchise proof |
| **Consultancy margin below 22% for two quarters** | Bearish — kill criterion 3; the mix thesis unravels |
| Order book falls below ₹18,000 Cr at a quarter-end | Bearish — kill criterion 4; growth stalls at 5x revenue coverage |
| Pay commission award with large retrospective | Bearish — 27% of revenue is employee cost; unmodelled margin hit |
| Promoter (GoI) stake sale / OFS | Neutral-to-bearish — would add supply; no signal of it today |

---

## 15. Exchange Filings & Material Announcements (last 120 days)

- **30 Oct 2026 — Q2/H1 FY27 results (consolidated + standalone, 17 pages, read in full).** Revenue ₹824 Cr consolidated (−10.5%), PAT ₹197 Cr (+135.6%), order book ₹20,421 Cr, H1 standalone operating cash flow ₹604.8 Cr. The primary document for this note; also the source of the ₹2,119 Cr cash & deposits and the −60-day working capital.
- **22 Sep 2026 — Press release: Dangote Kenya refinery PMC/EPCM contract, "value in excess of US$450 million"** (₹4,408.6 Cr per the Q2 presentation, awarded September 2026, completion March 2031), for a 700,000 bpd greenfield refinery and petrochemical plant at Mokowe, Kenya. Largest single order in the company's recent history; 21.6% of the order book.
- **28 Oct 2026 — Board comments on exchange fines:** NSE and BSE each levied ₹5,36,900 (25 Aug 2026) for Reg 17(1) non-compliance (independent directors / woman independent director) for the quarter ended 30 Jun 2026; appeal filed, GoI asked to fill vacancies; matter placed before the Board on 22 Sep 2026.
- **09 Sep 2026 — Appointment of statutory auditors:** CAG appointed M/s S C V & Co LLP for FY 2026-27 under s.139 of the Companies Act. Routine PSU rotation — **not** a resignation.
- **04 Nov 2026 — Q2 FY27 earnings-call transcript (19 pages, read in full):** the source for the ₹4,200-4,300 Cr FY27 revenue guide, the 25% consultancy margin floor, the ₹8,100 Cr inflow-to-date, the "at least 40% LSTK in H2" mix guide, the Middle East commentary, and the NRL ₹21 Cr / CEIL ₹11 Cr dividend breakdown inside other income.
- **22 Oct 2026 — Record date 05 Nov 2026 for ₹1.50 interim dividend** (FY27 first interim, declared 30 Oct 2026).
- **Corporate actions (NSE feed):** ₹2.50 final (ex 24 Sep 2026), ₹1.50 interim (ex 05 Nov 2026), ₹1.50 interim (ex 06 Mar 2026), ₹1.00 interim (ex 04 Dec 2025). No split, bonus or buyback in the period reviewed — so quoted price levels and EPS comparisons are valid across the window (last buyback was Jan 2021).

**Not found:** no bulk/block deal or SAST/Reg-29 disclosure for ENGINERSIN appears in the 120-day filing feed. Trendlyne's per-stock bulk-deal page could not be resolved for this symbol and ScanX does not permit a reliable symbol filter, so **the absence of exchange-reported block deals is reported as "not found in the sources checked", not as "none occurred".** The 11 November volume of 1.24 Cr shares at 23.3% delivery is nevertheless inconsistent with a registered block trade, which would have to show in delivery.

---

## 16. Verdict

**WATCH. Not a buy at ₹296.55; a buy on either a confirmed breakout above ₹324 on 40%+ delivery, or a pullback into ₹284-292 that holds the 50-day EMA.**

The business case is stronger than it has been in a decade and the file supports it with hard numbers: an order book that grew 56% in a year to ₹20,421 Cr and is 75% consultancy, ₹8,100 Cr of inflow already past full-year guidance, revenue mix shifted from 46% to 74% consultancy in a single quarter, PAT up 135% on a falling top line, 30.4% ROCE, zero debt, ₹2,119 Cr of cash and deposits, negative working capital, DIIs adding 4.4 percentage points in six months while retail exited. On quality alone this is the best balance sheet in its peer group at the second-lowest multiple.

But three things keep it off the buy list. First, **the multiple being quoted is wrong by 25%**: 18.6x trailing includes a ₹183 Cr post-tax turnkey closure gain, and on underlying earnings the stock is at 23.3x against a six-year median of 16.1x, for a business guiding 10-13% revenue growth. Second, **the technical trigger has failed**: the 11 November all-time high came on 4.8x volume with 23.3% delivery, and price is 8.4% below it — a breakout that nobody took delivery on. Third, **the order book is not the constraint, execution is**: ₹20,421 Cr covers 4.8 years of guided revenue, yet management guides FY28 revenue growth of only ~10% and H2 FY27 needs the biggest half-year in company history after two quarters of decline.

The stock is a 20.5/25 setup with one critical fail, in a sector with real tailwinds, at a price that already assumes the thesis works. That is a watchlist entry with two clearly defined triggers, not a position today.

**What I would do:** put it on the swing watchlist with an alert at ₹324 (breakout, needs delivery confirmation) and at ₹292/₹284 (pullback into the 20/50 EMA shelf). Position size on trigger: no more than 3% of portfolio for a ₹16,667 Cr PSU with 24% client concentration and 41% of earnings from other income; 2% if entering on the pullback without a fundamental catalyst. Stop below ₹277 (0.5 ATR under the 50-day EMA and the 4 Nov congestion), first target ₹350-360 (ICICI's ₹360 is 22.9x FY28E), second ₹389 (24.8x FY28E EPS — the FY24 peak multiple). Risk/reward at ₹292 entry with ₹277 stop and ₹360 target is 4.5:1. Reassess the whole thesis on the Q3 FY27 print in late January 2027 — that is where the ₹4,200 Cr revenue guide is settled.
