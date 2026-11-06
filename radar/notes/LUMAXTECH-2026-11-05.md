---
title: Lumax Auto Technologies Ltd (LUMAXTECH) — Radar Deep Dive
code: LUMAXTECH
date: 2026-11-05
band: micro
industry: Automobile and Auto Components
status: private research note — not published
price: 2100.20
verdict: WATCH — quality is real, price is at the ceiling
data_basis: Screener.in consolidated (26-metric logged-in snapshot of 2 Nov 2026, tables re-read against the public page of 4 Nov 2026), NSE bhavcopy sec_bhavdata_full 1 Sep 2025–4 Nov 2026 (291 unique sessions after deduplicating holiday copies), Q2 FY27 results PDF, investor presentation and 15-page earnings-call transcript filed with NSE on 24–25 Oct and 3 Nov 2026, NSE corporate-announcements API (940 records, filtered to 45 days), NSE corporate-actions API, Trendlyne deal history, investing.com and TradingView analyst consensus
---

# Lumax Auto Technologies — Radar Deep Dive

Private note for the multibagger radar. Not published, not deployable, not part of the website. One company, one Screener page (consolidated), paced. Every figure is read off an exchange filing, computed from the exchange's own bhavcopy, or labelled as an estimate.

**The one-line case.** A ₹14,300 Cr auto-component supplier that has grown revenue 34% a year for five years, converts profit to cash at 1.4x, runs negative working-capital days, and holds 65% of India's gear-shifter market — trading at 39.5x trailing earnings, four per cent below its all-time high, in a market that is itself below its 200-day average. The business case is strong and getting stronger. The entry case is not settled.

---

## 1. Quick Snapshot

| Item | Value |
|---|---|
| Price | ₹2,100.20 (NSE close 4 Nov 2026; previous close ₹2,047.70, +2.56%) |
| Market cap | ₹14,313 Cr (6.815 Cr shares of ₹2 face value) |
| 52-week range | ₹1,131 (7 Nov 2025) to ₹2,190 (23 Sep 2026) — 4.1% below the high, 85.6% above the low |
| P/E trailing | 39.5x on TTM EPS ₹53.22 (Screener prints 38.1 at its own ₹2,067 intraday mark) |
| P/E forward (derived) | 36x FY27E EPS ₹58, 32x FY28E EPS ₹66 — see §10 |
| P/B | 10.2x on book value ₹206 |
| EV/EBITDA | 18.8x on TTM EBITDA ₹818 Cr (gross-debt basis); 17.5x on the company's net-debt basis |
| EV/Sales | 2.7x |
| ROCE / ROE | 21.2% / 26.4% |
| Debt/equity | 0.81 (Screener, gross debt over parent equity); 0.67 on total equity; 0.03 on the company's net-debt basis |
| Dividend | ₹5.50/share for FY26, ex-date 6 Aug 2026, 0.26% yield, 13% payout |
| Promoter | 55.98%, unchanged for twelve quarters |
| Next results | Q3 FY27, late January to mid-February 2027 (investing.com carries 18 Feb 2027) |
| Radar ledger | Added 2 Nov 2026 at ₹2,022.70, 6 of 7 gates, band micro, score 72.5 |

Performance against the index is not subtle. Over twelve months the stock is **+75.1%** while the Nifty 50 is **−6.4%** (25,597.65 on 4 Nov 2025 to 23,960.60 on 4 Nov 2026). Over three months it is +28.5% against an index that spent late September and all of October printing its longest weekly losing streak in 25 years.

---

## 2. What the Company Does

Lumax Auto Technologies is the listed auto-component arm of the D.K. Jain group — separate from, and much smaller than, Lumax Industries, the lighting company in the same family fold. It makes the parts that sit between the driver and the vehicle: gear shifters and shift towers, interior and cockpit trim, seat frames, chassis and frame assemblies, emission systems, oxygen sensors, on-board antennas, telematics units, wiring harnesses, CNG delivery systems and, from July 2026, body control modules. It runs 29 plants across the Indian auto clusters and lists Mahindra & Mahindra, Maruti Suzuki, Bajaj Auto, Honda Motorcycle & Scooter, Tata Motors, Daimler India and Volkswagen as customers.

Two structural facts drive the economics.

**It sells by content per vehicle, not by unit.** Management puts the addressable basket at **₹70,000–75,000 per passenger vehicle** and ₹20,000–22,000 per two-wheeler (transcript, 27 Oct 2026). Roughly half of the PV number sits in the Intelligent Ambient Comfort (IAC) cockpit business; Greenfuel adds ₹5,000–8,000; mechatronics is about 20% of the total and is the fastest-growing slice. A rupee of premiumisation at the OEM therefore lands as revenue here without any unit-volume growth at all — which is why Q2 revenue grew 35% against 19% industry production growth.

**A large part of it is a joint-venture collection, not a factory.** Mechatronics runs on five global partnerships — Alps Alpine, Yokowo, Ituran, Nidec and FAE — where the technology and often the IP sit with the partner. That is a capital-light way to buy product categories, and it is also the structural weakness: the company does not own most of the technology it sells, and the JV partners take a share of the profit (minority interest ran at 11% of PAT in H1 FY27).

The portfolio was actively reshaped in 2026: the 50% stake in Lumax Jopp Allied Technologies was sold to Jopp Holding GmbH, completed 29 June 2026; the remaining 15.97% of Lumax FAE was bought in, making it wholly owned, also 29 June; and a 60% stake in Greenfuel Energy Solutions' alternate-fuels business was acquired for ₹153.09 Cr through Lumax Resources, taking the company into CNG and hydrogen fuel-delivery systems.

---

## 3. Why It Cleared the Gates

The brief calls them eight. The scorecard in `scripts/radar-scorecard.py` defines **seven** quantitative gates, and the note uses the eighth in the Mastek sense — the judgement gate that no ratio captures. On the seven, Lumax passed **six**.

| Gate | Test | Lumax | Result |
|---|---|---|---|
| Headroom | Market cap under ₹25,000 Cr | ₹13,786 Cr at screen price | Pass |
| Reinvestment | ROCE ≥ 18% | 21.2% | Pass |
| Durability | 5y sales CAGR ≥ 15%, margin not compressing | 5y sales CAGR 30.0% (Screener), OPM 13%→14% | Pass |
| Quality | CFO/PAT ≥ 0.8, debtor days ≤ 90 | 1.09x, 76 days | Pass |
| Balance | Debt/equity ≤ 0.5 | **0.81** | **Fail** |
| Management | Promoter ≥ 35% and stable | 55.98%, flat twelve quarters | Pass |
| Valuation | P/E ≤ 1.5x industry, or ≤ 35 | 37.2 vs industry 27.8 (limit 41.7) | Pass |

The balance fail is the only one, and it is real but blunt. Screener's 0.81 is total borrowings including lease liabilities (₹1,140 Cr) divided by equity attributable to the parent (₹1,405 Cr). On the company's own definition — long-term gross debt of ₹442 Cr — the ratio is 0.26, and on net debt after netting cash and investments it is 0.03. The truth sits between: **gross borrowings of ₹906 Cr excluding leases against total equity of ₹1,691 Cr is 0.54**, and that is the number to carry in your head. The gate is measuring a leveraged balance sheet as if it were a stressed one; it is not stressed, but it is not debt-free either.

The eighth gate — the one the ratios cannot see — is whether the growth has a floor under it. It does: an order book of ₹1,879 Cr disclosed quarterly, of which 85% is new business and 59% executes in FY28. That is the reason this note is a WATCH rather than a pass.

---

## 4. Three Years of Accounts

Consolidated, ₹ Cr. Source: Screener.in consolidated P&L, cash-flow and ratio tables, cross-checked against the FY26 investor release.

| | FY24 | FY25 | FY26 | TTM |
|---|---|---|---|---|
| Sales | 2,822 | 3,637 | 4,870 | 5,607 |
| Growth | — | +28.9% | +33.9% | — |
| Operating profit | 369 | 465 | 659 | 779 |
| OPM | 13% | 13% | 14% | 14% |
| Other income | 45 | 51 | 32 | 39 |
| Interest | 69 | 80 | 106 | 107 |
| Depreciation | 118 | 129 | 179 | 198 |
| PBT | 227 | 308 | 406 | 514 |
| Tax rate | 26% | 26% | 17% | — |
| Net profit | 167 | 229 | 337 | 421 |
| EPS | 19.10 | 26.08 | 40.91 | 53.22 |
| CFO | 265 | 290 | 460 | — |
| Free cash flow | 167 | 118 | 214 | — |
| CFO/EBITDA | 89% | 78% | 86% | — |
| ROCE | 18% | 19% | 21% | — |
| Debtor days | 75 | 80 | 76 | — |
| Working-capital days | −16 | −10 | −18 | — |
| Borrowings | 810 | 902 | 1,231 | 1,140 (Sep 26) |

Four things in that table matter more than the growth rate.

**FY26's 47% profit growth is partly a tax artefact.** The effective rate fell from 26% to 17%, so PBT grew 31.8% while PAT grew 47.2%. The operating story is the 31.8%, not the 47%. Anyone quoting 47% as the run-rate is quoting a one-year tax break.

**Cash conversion is genuine and improving.** CFO/EBITDA has held between 78% and 89% for six years, FY26 free cash flow was ₹214 Cr after ₹233 Cr of capex, and H1 FY27 operating cash flow was ₹322.9 Cr — 1.5x the ₹215.3 Cr of pre-minority profit. This is not a company booking revenue it cannot collect.

**Working capital is negative, and that is the quiet engine.** Working-capital days of −18 mean suppliers fund the cycle: trade payables of ₹984 Cr against receivables of ₹1,048 Cr and inventory of ₹459 Cr. A business that grows 34% while releasing working capital produces cash growth faster than profit growth. It also means a supplier-payment shock would be felt immediately.

**Debt has more than doubled in three years while nothing looked wrong.** ₹664 Cr (FY23) → ₹1,231 Cr (FY26). Some of it is capex (₹233 Cr in FY26 alone, six greenfield plants under way), some is the Greenfuel acquisition, and some is growth working capital. Net debt is small because the balance sheet also carries ₹265.8 Cr of current investments and a much larger non-current investment book — mostly the strategic stakes in the JVs and in Lumax Industries — which the company nets off to arrive at the headline ₹41 Cr. Treat "net debt ₹41 Cr" as true only if you accept that strategic stakes are liquid. On cash alone, net debt is about ₹810 Cr, or 0.9x FY27E EBITDA: comfortable, not absent.

---

## 5. The Last Two Quarters

| ₹ Cr | Q2 FY26 | Q1 FY27 | Q2 FY27 | YoY | QoQ |
|---|---|---|---|---|---|
| Revenue | 1,156.4 | 1,363.6 | 1,555.5 | +35% | +14% |
| EBITDA (incl. OI) | 170.1 | 205 | 228.2 | +34% | +11% |
| EBITDA margin | 14.7% | 15.1% | 14.7% | flat | −40bps |
| PBT | 104 | 132 | 154 | +48% | +17% |
| PAT before minority | 77.6 | 99 | 116.7 | +50% | +18% |
| PAT after minority | 66.8 | — | 105.5 | +58% | — |
| EPS (₹) | 9.81 | 12.71 | 15.48 | +58% | +22% |

**The reporting trap in this quarter is the minority interest.** The company's release leads with PAT before minority of ₹116.7 Cr (+50%). Most media carried net profit of ₹105.5 Cr (+57.5% to +59%), which is after minority. Both are correct; neither is comparable to the other. The 11% minority share is structural — it is the JV partners' cut — and management guided that it stays at that level.

**Segment detail, Q2 FY27:** Advanced Plastics ₹886 Cr (+44%), Structures & Control Systems ₹258 Cr (+28%), Alternate Fuels ₹109 Cr (+46%), Aftermarket ₹131 Cr (+11%), Mechatronics ₹93 Cr (+36%). Advanced Plastics is 57% of revenue and its growth is the IAC cockpit business, of which roughly 60% is the ambient-comfort line.

**The one soft spot is Aftermarket** — 9% growth in H1, 11% in Q2, against a stated 15–20% ambition. Management's explanation is that input-cost pass-through pushed prices up in the non-lighting category where the company is not the market leader, and demand thinned. That is a coherent explanation and also an admission that pricing power is limited outside the leadership categories. Aftermarket is only 8% of revenue, so it does not move the consolidated number, but it is the highest-margin slice.

**Where the growth came from, in one line:** 19% industry production growth plus content-per-vehicle gains plus two acquisitions plus premiumisation. Management was explicit that the prior-year base was soft and that H2 comps get harder.

**Guidance, raised mid-year.** In the call, the CFO walked through the arithmetic: the original plan implied 12–14% growth for FY27 because FY26's 35% base was so high. After 34% in H1, the full year is now guided at **20–25% growth, or close to ₹6,000 Cr**. H2 is guided to 15–20%. The FY28 absolute EBITDA target of **₹1,000 Cr** was reaffirmed, against ₹500 Cr in FY25.

**On margins, the answer was honest and unhelpful.** Q2 margin fell 40bps QoQ because input-cost pass-through raises revenue and cost by the same rupee amount — the company recovers the increase but earns nothing on it, so the percentage dilutes. Management guided 30–40bps of dilution and said it expects to recover in subsequent quarters. The 20% long-term margin vision was repeated without a date; the nearer-term framing was "100–200bps over the next few years, closer to 17–18%".

---

## 6. Shareholding

| | Dec 25 | Mar 26 | Jun 26 | Sep 26 | 4-quarter change |
|---|---|---|---|---|---|
| Promoters | 55.98% | 55.98% | 55.98% | 55.98% | 0.00pp |
| FIIs | 8.00% | 8.38% | 8.70% | 8.89% | +0.89pp |
| DIIs | 16.52% | 16.81% | 16.53% | 17.12% | +0.60pp |
| Public | 19.49% | 18.83% | 18.79% | 18.00% | −1.49pp |
| Shareholders | 51,736 | 58,405 | 64,759 | 66,176 | +27.9% |

The promoter stake has not moved a basis point in twelve quarters. That is stability, and it is also the absence of any insider signal — nobody at the company has bought or sold meaningfully in three years.

The institutional flow is the cleanest part of the story. FIIs bottomed at 5.31% in March 2025 and have added 3.58pp in six quarters; DIIs went from 16.09% to 17.12% over the same six quarters (+1.03pp) and from 14.19% two years ago. Together they now hold 26.0% against a public float of 18.0% — unusual for a ₹14,000 Cr microcap-band name, and it means the marginal seller is retail.

The shareholder count tells the same story from the other side: 26,561 in December 2023 to 66,176 in September 2026, a 2.5x increase, with public holding falling 1.8pp over the same period. Retail is arriving in number but holding a smaller slice — new money is being absorbed by institutions, not the other way round.

---

## 7. Delivery and Price Structure

NSE bhavcopy, 291 unique sessions to 4 Nov 2026.

| Session | Close | Volume | Delivery % |
|---|---|---|---|
| 27 Oct | 1,910.40 | 184,403 | 53.55 |
| 28 Oct | 2,043.10 | 553,342 | 27.39 |
| 29 Oct | 2,058.50 | 383,708 | 38.48 |
| 30 Oct | 2,022.70 | 130,384 | 38.13 |
| 2 Nov | 2,014.40 | 143,320 | 42.69 |
| 3 Nov | 2,047.70 | 59,934 | 44.15 |
| 4 Nov | 2,100.20 | 155,346 | 46.37 |

Average delivery over 20 sessions is **42.8%**, over 60 sessions **42.4%**, against an NSE large-cap baseline of roughly 37%. That is accumulation-grade, not churn.

The exception is instructive. The single biggest volume day of the move — 28 October, 553,342 shares, 2.8x the 20-day average, +6.95% — carried only **27.4% delivery**. That is the results reaction, and it was largely intraday. The genuine accumulation came afterwards: the 3–4 November leg, +4.3% in two sessions, carried 44% and 46% delivery on modest volume. The pattern is "reaction on low delivery, absorption on high delivery", which is healthier than the reverse, but it means the 28 October gap is not itself evidence of institutional buying.

**Price structure.** Four phases in twelve months:

1. **Recovery, Nov 2025 – Feb 2026.** ₹1,131 low on 7 November 2025, then a 15.5% single-day move on 10 November (2.6 mn shares, 21% delivery) that started the re-rating. High of ₹1,823.90 on 12 February 2026.
2. **Correction, Feb – Jul 2026.** Down to ₹1,384.40 on 17 July — a 24% drawdown that tested patience.
3. **Breakout, Aug – Sep 2026.** ₹1,568 (July close) to ₹2,190 on 23 September, a 40% move in eight weeks on the back of the IAC and Greenfuel consolidation.
4. **Pullback and reclaim, Oct – Nov 2026.** −19.5% to ₹1,764 on 8 October, then the results-driven recovery to ₹2,100. The stock is now 4.1% below its all-time high.

The swing-low sequence — ₹1,384 (Jul) → ₹1,894 (Sep) → ₹1,764 (Oct) — is not a clean staircase. The October low undercut September. What keeps the uptrend intact is that it held well above the July low and the 100-day average throughout.

---

## 8. The 25-Point Swing Assessment

Live technicals computed from exchange closes on 4 Nov 2026: EMA9 ₹2,005, EMA20 ₹1,965, EMA50 ₹1,925, EMA100 ₹1,845, EMA200 ₹1,708 (see warm-up caveat in §18); RSI(14) 62.7; MACD 30.4 against a signal of 5.4, histogram +25.0; Bollinger upper ₹2,112, price at 97% of band width; ATR ₹96, or 4.6% of price.

| # | Check | Reading | Verdict |
|---|---|---|---|
| 1 | Price position | 4.1% below the all-time high of ₹2,190 | **Pass** |
| 2 | Trend | Above all five EMAs; 200-EMA rising 2.8% in 20 sessions; October low undercut September's | **Pass** |
| 3 | Volume characteristics | Up-day volume 2.4x down-day volume, but the 4 Nov +2.56% came on 0.79x average volume and the biggest day delivered only 27% | **Caution** |
| 4 | Clean price action | ATR 4.6%; six moves over 5% in eight weeks; results gaps | **Caution** |
| 5 | EMA alignment | 9 > 20 > 50 > 100 > 200, price above all; but the 20-EMA slope is still −1.4% over 20 sessions | **Pass** |
| 6 | Chart pattern and base | Cup from May–Jul base, breakout in August, 19.5% handle into October — deeper than a textbook handle | **Caution** |
| 7 | Base quality | Six-month base, tightening September, but the right side needed a full retest | **Caution** |
| 8 | ADR | ₹96 per day, 4.6% — suited to swing trading only with wide stops | **Pass** |
| 9 | Primary uptrend | 200-EMA rising, price 22.9% above it, +85.6% off the low | **Pass** |
| 10 | One trading model | Setup is a defined breakout-or-pullback model, not improvisation | **Pass** |
| 11 | Sector strength | Auto components led the November tape; peers up 2–6% on 4 Nov | **Pass** |
| 12 | Tailwind | GST 2.0 affordability, premiumisation, content-per-vehicle, localisation | **Pass** |
| 13 | IPO consideration | Listed 1981, no IPO base | **N/A** |
| 14 | Price action strength | +75% against a −6.4% index over twelve months | **Pass** |
| 15 | Sector and government boost | GST 2.0 and the auto-component PLI are both live | **Pass** |
| 16 | Fundamental quality | ROE 26.4%, ROCE 21.2%, negative working capital, CFO/PAT 1.09x; gross D/E 0.81 | **Pass** |
| 17 | Quarterly earnings growth | Revenue +35%, PAT +50% (pre-minority), third consecutive acceleration | **Pass** |
| 18 | Delivery percentage | 42.8% average over 20 sessions, 46.4% on the latest | **Pass** |
| 19 | News and institutions | Q2 beat, guidance raised, FIIs and DIIs both adding | **Pass** |
| 20 | Risk management | Levels defined in §15 | **Pass** |
| 21 | Market environment | Nifty 50 at 23,960 against a 40-week average of 24,134 — below it, and −6.4% over a year | **Caution** |
| 22 | Liquidity | ₹32 Cr traded per session; adequate, not deep for a ₹14,000 Cr name | **Pass** |
| 23 | Relative strength | RS6m +28.3 against the radar universe; sector-leading | **Pass** |
| 24 | Breakout confirmation | No breakout yet — price is 4.1% under the ₹2,190 high | **Caution** |
| 25 | Trading psychology | The temptation here is to buy strength into resistance | **Pass** |

**Score: 21.0 of 25** (18 Pass = 18.0, 6 Caution = 3.0, one N/A excluded; scaled to a full 25 it is 21.9). That is the top of the "moderate — needs a catalyst" band, not the "strong setup" band. No critical fail on items 1, 2, 6, 20 or 24 — item 24 is a caution, which is the correct reading of a stock sitting just below its high rather than through it.

The honest summary: this is a strong chart that has not yet confirmed its breakout. Buying at ₹2,100 means buying the fourth attempt at ₹2,190 with a 4.6% average daily range and a chart that just spent five weeks going sideways-to-down.

---

## 9. Screener Says

**Pros (verbatim):** company is expected to give a good quarter; company has delivered good profit growth of 43.8% CAGR over the last 5 years; company has been maintaining a healthy dividend payout of 21.1%; company's median sales growth is 19.8% over the last 10 years.

All four are true and none of them is the point. The 19.8% decade median understates what has happened since FY23 — revenue has compounded 38% over three years — and the 21.1% dividend payout is a historical average that has since halved to 13% as capex absorbed the cash.

**Cons:** one only — "stock is trading at 10.1 times its book value."

That single con is the entire bear case in five words, and the machine-generated checklist cannot see the second one: **a 14% EBITDA margin that has not moved in twelve quarters**, which is what makes 10x book expensive rather than merely high.

---

## 10. Valuation

| Metric | Lumax | Basis |
|---|---|---|
| P/E trailing | 39.5x | ₹2,100.20 ÷ TTM EPS ₹53.22 |
| P/E FY27E | 36x | Derived: ₹6,000 Cr revenue, 14.8% EBITDA, 25% tax, 11% minority |
| P/E FY28E | 32x | Derived: ₹1,000 Cr EBITDA guidance, depreciation ₹230 Cr, interest ₹95 Cr |
| PEG (Screener) | 0.86 | P/E ÷ 3-year profit CAGR 43.4% |
| PEG (forward, FY28) | ~2.1 | Forward P/E 32 ÷ 15% EPS growth FY27→FY28 |
| P/B | 10.2x | Book ₹206 |
| EV/EBITDA | 18.8x | EV ₹15,359 Cr ÷ TTM EBITDA ₹818 Cr |
| EV/Sales | 2.7x | |
| Industry P/E | 27.8x | Screener median, 131 companies |
| Earnings yield | 2.53% | 1 ÷ 39.5 |

**The two PEGs disagree and both are right.** Trailing PEG of 0.86 uses a 43.4% three-year profit CAGR that was flattered by a low base and a tax break; it says the stock is cheap relative to what has happened. Forward PEG of 2.1 uses the 15% EPS growth implied by the company's own FY28 EBITDA target after higher depreciation and interest; it says the stock is expensive relative to what happens next. The gap between them *is* the investment question. If FY28 comes in at ₹1,000 Cr EBITDA, earnings grow roughly 15% and 32x is rich. If the ₹1,879 Cr order book lands on schedule and EBITDA overshoots to ₹1,100 Cr, earnings growth is nearer 30% and 32x is fair.

**Peer set, NSE closes 4 Nov 2026, P/E rebased to those closes from Screener's 4 Nov marks:**

| Company | CMP ₹ | P/E | ROCE | Mcap ₹ Cr |
|---|---|---|---|---|
| Samvardhana Motherson | 159.49 | 37.1 | 13.4% | 1,69,617 |
| Bosch | 50,925 | 63.6 | 21.5% | 1,49,372 |
| Bharat Forge | 1,812.80 | 87.7 | 12.6% | 88,562 |
| Uno Minda | 1,196.90 | 56.6 | 19.7% | 69,016 |
| Sona BLW | 893.70 | 69.2 | 15.1% | 55,856 |
| Schaeffler India | 3,507.20 | 40.5 | 27.9% | 54,683 |
| Tube Investments | 2,250.50 | 69.5 | 17.1% | 43,641 |
| **Lumax Auto Tech** | **2,100.20** | **38.7** | **21.2%** | **14,313** |
| Industry median (131 cos) | — | 27.8 | 16.4% | — |

Lumax is the second-cheapest name in that peer list and the third-most capital-efficient behind Schaeffler (27.9%) and Bosch (21.5%). Motherson is cheaper on P/E (37.1x) but earns 13.4% on capital against Lumax's 21.2%. On a ROCE-per-turn-of-P/E basis — the value-destruction check the playbook asks for — Lumax has the best combination in the set: 21.2% ROCE at 38.7x, against Sona at 15.1% ROCE and 69.2x.

That is the strongest single argument for owning it, and it is why the valuation is not obviously wrong at 39x. The counter is that the whole peer set is priced for a cycle that is currently expanding at 19% industry production growth; if that rolls over, every multiple in the table compresses together.

**Howard Marks, four methods:**

| Criterion | Test | Result |
|---|---|---|
| Earnings yield vs risk-free | 2.53% vs 7.40% India 10Y G-sec (CCIL, 30 Oct 2026) | **Fail** |
| PEG < 1.0 | 0.86 on the 3-year CAGR | **Pass** |
| Positive margin of safety on book | Price is 10.2x book; MoS is −919% | **Fail** |
| Price near earnings power value | EPV ₹443 at 12% cost of capital; price/EPV 4.7x | **Fail** |
| ROCE above cost of capital | 21.2% vs ~12% | **Pass** |
| **Composite** | | **Expensive on asset and cash-flow terms; the growth is doing all the work** |

The market is paying for the next five years today. That is normal for a company growing 34% with 21% returns, and it is also the definition of a stock with no valuation cushion if the cycle turns.

---

## 11. Bull Case

1. **The order book has a date on it.** ₹1,879 Cr at end-Q2, up from ₹1,600 Cr at end-Q1 and ₹1,450 Cr at FY26 year-end — three consecutive quarters of growth. 85% is new business; ₹258 Cr executes in FY27, ₹1,117 Cr in FY28 and ₹504 Cr in FY29. Against ₹6,000 Cr of guided FY27 revenue the book is worth 31% of a year, and because 59% of it lands in FY28 it is effectively a down payment on next year's number rather than this one's. This is not a hope; it is a disclosed, dated pipeline that the company updates every quarter.
2. **Content per vehicle is the right place to be in Indian autos.** ₹70,000–75,000 per PV addressable today, guided to rise about 10% in two to three years as body control modules and connected-vehicle electronics land. Premiumisation and localisation both convert directly into revenue here without needing unit growth.
3. **The balance sheet can fund the plan without equity.** ₹322.9 Cr of H1 operating cash flow, ₹401 Cr of free cash, ₹300 Cr of guided FY27 capex, and six greenfield plants funded from debt and internal accruals. There is no dilution risk in the plan.
4. **The FY28 EBITDA doubling is the underwriting number, and it is not a stretch.** ₹500 Cr (FY25) to ₹1,000 Cr (FY28) is a 26% CAGR. H1 FY27 already delivered ₹434 Cr; H2 needs about ₹453 Cr at the guided 15–20% growth and the current 14.7% margin to land FY27 near ₹887 Cr. From there the ₹1,000 Cr FY28 target needs only 13% EBITDA growth — the lowest bar the company has set itself in three years.
5. **Capability, not just capacity.** The BCM programme went into production in July 2026, standalone, with a ₹250 Cr order book and technology licensed from an unnamed large Japanese component maker; the ₹150 Cr Manesar plant is funded and the peak turnover is guided at ₹500 Cr from Q3 FY28. If that works, the company moves from a 14% margin parts supplier to something closer to an electronics supplier — which is the only route to the 20% margin vision.
6. **Institutions have been buying for six quarters.** FIIs 5.31% → 8.89% since March 2025, DIIs 16.09% → 17.12% over the same span, and together they now own 26% of a name whose public float is 18%. Delivery of 42.8% over 20 sessions says the buying is being taken, not flipped.

---

## 12. Bear Case

1. **The FY28 target implies an earnings slowdown, not an acceleration.** ₹1,000 Cr of EBITDA on roughly ₹7,000 Cr of revenue means a 14.3% margin — lower than H1 FY27's 14.9%. After ₹230 Cr of depreciation and ₹95 Cr of interest, that is about ₹66 of EPS against ₹58 in FY27: 15% growth for a stock at 32x forward. The order book grows revenue; it does not obviously grow margins.
2. **Fourteen per cent is a ceiling, not a floor, until proven otherwise.** OPM has printed 13%, 13%, 14% for three years and 12–14% for twelve consecutive quarters. The 20% target is a "5 to 7 year" vision with no year attached, and every rupee of input-cost pass-through dilutes the percentage by construction because the company recovers cost, not margin.
3. **The cycle is being flattered by a one-off demand event.** Q2 industry production grew 19% — PV +25%, CV +34%, 3W +25% — on the base of GST 2.0 affordability and a soft prior year. Management itself guided H2 to 15–20% and flagged that the base normalises. An auto-component supplier at 39x trailing into a decelerating H2 is the classic set-up for multiple compression, and RBI tightening into FY28 works against vehicle affordability.
4. **The company does not own most of its technology.** Mechatronics runs on five JV partnerships where the IP sits with Alps Alpine, Yokowo, Ituran, Nidec and FAE. The BCM programme is build-to-print under licence from a partner it will not name. That is a fast way to add product categories and a slow way to add margin — and it cedes 11% of profit to minorities every quarter.
5. **Debt doubled in three years and the "net debt ₹41 Cr" headline nets off strategic stakes.** Gross borrowings of ₹906 Cr plus ₹235 Cr of leases against ₹1,691 Cr of equity is 0.67. It is manageable at current profitability; it is also the line item that turns a bad cycle into a problem.
6. **The chart is at resistance, not through it.** 4.1% below the all-time high after a 75% year, with RSI 63, an ATR of 4.6%, and an index below its 40-week average. The 28 October breakout day delivered only 27% delivery. Momentum names at this extension tend to need either a high-volume breakout or a 10–15% reset before the next leg.

---

## 13. Kill Criteria

Observable within two quarters. Any one of these ends the thesis as written.

1. **FY27 revenue below ₹5,700 Cr.** Guidance is ₹6,000 Cr and H1 is ₹2,919 Cr; a miss that size means the H2 deceleration is worse than guided.
2. **EBITDA margin below 13.5% for two consecutive quarters.** That would make 14.9% a peak, and the FY28 ₹1,000 Cr EBITDA target arithmetically unreachable without a revenue surge.
3. **Order book below ₹1,600 Cr at any quarter-end.** The pipeline has grown three quarters running; the first sequential decline means the book is being consumed faster than it is replaced.
4. **Gross borrowings above ₹1,400 Cr, or the Screener debt/equity above 1.0.** The balance gate already failed once; failing it harder removes the funding-for-growth argument.
5. **The Manesar BCM plant slips beyond Q3 FY28, or the ₹250 Cr BCM order book is not converted by FY28.** The electronics transition is the entire margin story.
6. **A close below ₹1,764**, the 8 October low and the last higher low in the sequence. Below it, the October pullback becomes a downtrend; the 100-day average at ₹1,845 sits above the price, not below it, so there is no moving-average support between ₹1,764 and the July low of ₹1,384.

---

## 14. What Would Change Our View

| Event | Impact on thesis |
|---|---|
| Q3 revenue above ₹1,650 Cr with margin back above 15% | Bullish — the pass-through dilution was temporary and the H2 guide is conservative |
| A decisive close above ₹2,190 on 1.5x volume with delivery above 40% | Bullish, technically — the 25-point breakout item flips from caution to pass |
| Order book above ₹2,100 Cr at Q3 | Bullish — the pipeline is compounding faster than it executes |
| FY28 EBITDA guidance raised above ₹1,000 Cr | Bullish, sharply — it resets the forward PEG from 2.1 back toward 1.5 |
| BCM capacity sold out through FY29 | Bullish — the only credible route to 17–18% margins |
| FY27 revenue lands below ₹5,700 Cr | Bearish — the cycle is turning faster than guided |
| Margin prints 13.5% or lower in Q3 | Bearish — fourteen per cent is the ceiling after all |
| Order book falls below ₹1,600 Cr | Bearish — growth is being consumed, not booked |
| FII or DII holding falls in the December quarter | Bearish — the six-quarter accumulation pattern breaks |
| RBI delivers two further hikes by March 2027 | Bearish — auto demand and the multiple both compress |

---

## 15. Trading and Position Framework

For a swing position, on the 4 Nov close of ₹2,100.20 and an ATR of ₹96:

- **Entry:** not here. Two valid triggers — (a) a close above **₹2,190** with volume ≥1.5x the 20-day average and delivery ≥40%, or (b) a pullback into **₹1,925–1,845** (50-EMA and 100-EMA) that holds on declining volume.
- **Stop:** ₹2,060 on a breakout entry (below the 2–3 November consolidation at ₹2,014–2,048); ₹1,760 on a pullback entry (below the October low).
- **Targets:** ₹2,340 (T1) and ₹2,520 (T2, between the two consensus means of ₹2,457 and ₹2,562).
- **Risk/reward:** breakout entry at ₹2,195 against a ₹2,060 stop is ₹135 of risk for ₹325 to T2, **2.4:1**. Pullback entry at ₹1,885 against ₹1,760 is ₹125 of risk for ₹305 to T2, **2.4:1**.
- **Invalidation:** two consecutive closes back below ₹2,000 after a breakout attempt.

For a longer-term position, the sizing rule for a sub-₹15,000 Cr name applies: **no more than 5% of portfolio**, and it should be built in two tranches, not one — half on a confirmed breakout, half on any retest of ₹1,925.

---

## 16. Exchange Filings and Material Announcements (45 days to 4 Nov 2026)

Eight filings were classified as price-moving interest by the NSE announcements API out of 940 in the symbol's record. The material subset is below; routine investor-meet scheduling, trading-window closures, compliance certificates and newspaper publication are excluded.

- **24 Oct 2026 — Q2/H1 FY27 results and investor release** ([PDF](https://nsearchives.nseindia.com/corporate/LUMAXTECH_24102026172957_LATLPressRelease24102026.pdf)). Revenue ₹1,555.5 Cr, EBITDA ₹228.2 Cr at 14.7%, PAT before minority ₹116.7 Cr. The document that re-rated the stock.
- **24 Oct 2026 — Board outcome: ₹150 Cr Manesar Mechatronics plant and a ₹15 Cr corporate guarantee for Lumax Greenfuel** ([PDF](https://nsearchives.nseindia.com/corporate/LUMAXTECH_24102026161921_LATLOutcome24102026.pdf)). The guarantee secures bank/NBFC loans for a 60%-owned subsidiary's capex and working capital — small, but it is contingent liability on a business the company has owned for under a year.
- **25 Oct 2026 — Investor presentation** ([PDF](https://nsearchives.nseindia.com/corporate/LUMAXTECH_25102026131108_InvestorPresentation25102026.pdf)). Source for the order-book mix, the phase-wise execution schedule, the segment split, the North Star 20.20.20.20 framework, the greenfield timeline and the September balance sheet used in §4.
- **27 Oct 2026 — Earnings call recording link** ([PDF](https://nsearchives.nseindia.com/corporate/LUMAXTECH_27102026182733_LATLAudioLinkforearningscall27102026.pdf)).
- **3 Nov 2026 — Q2 FY27 earnings-call transcript, 15 pages** ([PDF](https://nsearchives.nseindia.com/corporate/LUMAXTECH_03112026181029_LATLEarningCallTranscript03112026.pdf)). The guidance raise to 20–25%, the H2 15–20% framing, the margin pass-through mechanics, the content-per-vehicle numbers, the BCM licence structure and the JOPP JV dissolution all come from here.
- **25 Sep 2026 — Senior management changes** ([PDF](https://nsearchives.nseindia.com/corporate/LUMAXTECH_25092026163612_LATLChangesinSMP25092026.pdf)). Superannuation of a Senior EVP; no CFO or CEO change.

Corporate actions checked: **no split, bonus, buyback or rights issue** in the period or in any year that would invalidate the price levels quoted. Dividends of ₹5.50 per share in each of FY24, FY25 and FY26; ex-date 6 August 2026 for the latest.

**Corporate events earlier in calendar 2026**, from the filings and the annual report record rather than the 45-day window: the sale of the entire 50% stake in Lumax Jopp Allied Technologies to Jopp Holding GmbH, completed 29 June 2026, with an impairment of ₹7.04 Cr taken in the standalone FY26 accounts; the purchase of the remaining 15.97% of Lumax FAE Technologies from Francisco Albero SAU, also 29 June 2026, making it wholly owned; and the 60% acquisition of Greenfuel Energy Solutions' alternate-fuels business for ₹153.09 Cr.

**Bulk and block deals:** the most recent bulk deal on record is **27 May 2024** (606,000 shares at ₹478 on NSE). No bulk or block deal appears in any 2026 search across Trendlyne, BSE's deal page and moneycontrol. The institutional accumulation visible in the shareholding table happened through ordinary market purchases, not exchange-reported blocks. This check is search-based, not an exhaustive scan of every exchange deal file.

---

## 17. Verdict

**WATCH — the business is genuinely good; the price already knows it.**

Lumax passes six of seven gates with the only miss on a debt ratio that overstates the leverage, grows revenue at 34% with cash conversion above 1x, runs negative working capital, holds 65% of the gear-shifter market, has an order book with dates on it, and trades at a discount to every quality peer except Motherson while earning more on capital than all but two of them. That is a rare combination and it justifies a permanent place on the radar.

What it does not justify is buying at ₹2,100, four per cent below an all-time high, on the day after a 2.6% move, with RSI at 63, the index below its 40-week average, and a 25-point score of 21.0 that sits at the top of the "moderate" band with the breakout item still a caution. The 39.5x trailing multiple is not absurd for this growth — but every valuation cushion is gone, and the FY28 EBITDA target the company has pinned its credibility to implies 15% EPS growth, not 35%.

The next two quarters resolve it. If Q3 shows revenue above ₹1,650 Cr with margin back above 15% and the order book above ₹2,000 Cr, then the ₹1,000 Cr FY28 EBITDA number is on track, the forward PEG falls from 2.1 toward 1.5, and the stock breaking ₹2,190 is a buy rather than a chase. If Q3 shows margin at 14% or below and the order book flat, then 39.5x is the right multiple for a 14%-margin cyclical near its peak, and the October low of ₹1,764 becomes the level that matters.

**What I would do:** nothing today. Set alerts at ₹2,190 (breakout, needs volume and delivery confirmation) and at ₹1,925 (50-EMA pullback). Take the first trigger that arrives, size it at no more than 5% of portfolio, and re-underwrite after Q3 against the six kill criteria.

**Radar disposition:** leave as `analysed` with outcome `watch`. It is the strongest fundamentals-to-price combination of the three names queued this week, and it is the one most likely to be bought at the wrong moment.

---

## 18. Sources and Data Notes

- **Prices, volume, delivery, highs and lows:** NSE `sec_bhavdata_full` daily files, 1 Sep 2025 – 4 Nov 2026, **291 unique sessions**. Six duplicate bars were removed because NSE serves the previous session's file on exchange holidays — 5 Nov 2025, 2 Oct 2026, 20 Oct 2026 and 1 Nov 2026 each returned an exact copy of the prior day and would have distorted the EMA and RSI series.
- **One price discrepancy, and it is trivial:** Screener prints the 52-week low as ₹1,129; the bhavcopy file shows ₹1,131.0 on 7 November 2025. A ₹2 difference on a ₹2,100 stock, recorded here rather than silently harmonised.
- **Technicals:** computed in this environment from the deduplicated exchange series using standard periods — EMA 9/20/50/100/200, RSI 14 (Wilder), MACD 12-26-9, Bollinger 20-2, ATR 14. TradingView's live panel was not reachable from this environment; the exchange closes are the better source for historical bars in any case, per the playbook's own rule.
- **EMA200 caveat:** the bhavcopy window is 291 sessions, so the 200-EMA has only about 91 sessions of warm-up and the level is approximate. The repo's own 291-session run prints ₹1,784 against this note's ₹1,708; the true value sits in that band. The conclusion — price 18–23% above a rising 200-EMA — is unaffected by which end of the band is right.
- **Fundamentals:** Screener.in consolidated view. The 26-metric logged-in snapshot was captured 2 Nov 2026 and the tables were re-read against the public consolidated page on 4 Nov 2026; the quarterly and annual lines matched the Q2 FY27 filing line for line. Screener's "Net Profit" row is PAT before minority interest, which is why it reads ₹421 Cr TTM against an attributable figure nearer ₹363 Cr; EPS rows are on the attributable number.
- **Balance sheet:** taken from page 29 of the Q2 FY27 investor presentation (Sep 2026 against Mar 2026), not from Screener, because the presentation carries the lease and minority lines separately.
- **Concall:** the full 15-page transcript filed 3 Nov 2026 was read in full, not summarised from the press release. Every management quotation in this note is from that document.
- **Filings:** NSE corporate-announcements API for the symbol, 940 records, filtered to 45 days and classified by subject; corporate-actions endpoint for dividends and splits.
- **Analyst estimates:** investing.com consensus (5 analysts, 5 buy / 0 sell, mean 12-month target ₹2,457.20, range ₹2,035–2,909) and TradingView (mean ₹2,562.17, range ₹2,310–2,909). Neither is used to derive the forward P/E; both are cited as market context.
- **Risk-free rate:** India 10-year G-sec **7.40%** (CCIL, 30 Oct 2026). The 6.5% figure in the standing playbook is out of date and would have understated the earnings-yield failure.
- **What is estimated, and labelled as such:** FY27E EPS ₹58 and FY28E EPS ₹66 are derived here from management's own revenue and EBITDA guidance (₹6,000 Cr revenue, ₹1,000 Cr FY28 EBITDA), a 25% tax rate and an 11% minority share — they are not analyst figures. EV/EBITDA uses gross debt including leases. Gross leverage of 0.54 excludes leases.
- **What is not known:** the identity of the Japanese BCM technology partner; whether the ₹41 Cr net-debt figure nets strategic investments that could not be sold at book; and the FY27 margin path beyond management's 30–40bps dilution comment.
