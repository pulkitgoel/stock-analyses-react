/**
 * The byline the site publishes, and the two disclosure decisions that belong to
 * the owner.
 *
 * AGENTS.md section 6 lists both as "editorial decisions that need a human, not
 * an agent" and says to surface them and wait. So they are declared here, unset,
 * and every component that would render them omits the slot entirely while the
 * value is null. Nothing placeholder-shaped ever reaches a reader: an empty chip
 * or a bracketed "[registration status]" on a YMYL page is worse than no chip.
 *
 * Setting either value turns it on everywhere it belongs. That is the whole
 * change — no component edit, no hunting for call sites.
 */

/**
 * How AI involvement is disclosed to a reader, or null to disclose nothing in
 * the UI.
 *
 * The decision, as section 6 frames it: every article already carries a `model:`
 * field (deepseek-chat 204, deepseek-v4-flash 37, kimi-k2.5 3), and it is
 * publicly fetchable at `/analyses/{slug}.md`. But only 54 of 250 name the model
 * in visible body text; 177 keep it in frontmatter only. Section 6 calls that
 * partial position "the weakest of the three available" and gives the two
 * coherent alternatives: disclose consistently in the byline, `/about` and
 * `/disclaimer`, or stop publishing the field.
 *
 * Note the asymmetry this creates while it stays null. 7.14 adds a visible human
 * byline, so a reader now sees an author and no mention of AI, while the fact
 * remains one fetch away in the markdown. That widens the gap between what a
 * reader sees and what is true. It is an argument for settling the decision, not
 * for withholding the byline — the authorship claim is already in the JSON-LD
 * and the `<meta name="author">` either way.
 *
 * To disclose, set a short line. It is rendered next to the byline and reads
 * best in the form "<what was done>, <who checked it>". The article's own
 * `model` value is substituted for `{model}` where present, so one string covers
 * all three models:
 *
 *     export const AI_DISCLOSURE = 'Drafted with AI ({model}), reviewed by the author';
 *
 * Whatever is chosen has to be true of every article it appears on — which is
 * why the wording is a decision and not a default.
 */
export const AI_DISCLOSURE: string | null = null;

/**
 * The site's regulatory standing, as published to readers, or null to publish
 * nothing.
 *
 * This is a legal statement about a person, not a UI string, and section 6 is
 * explicit that whether the site engages the SEBI Research Analyst Regulations
 * "is a question for a professional, not an agent". The site publishes verdicts
 * with support and resistance levels for 21 live watchlist names and the word
 * SEBI appears nowhere on `/about` or `/disclaimer`.
 *
 * `DESIGN.md` section 4 wrote "Not a SEBI-registered research analyst" into the
 * disclosure strip. That was a layout placeholder and is NOT a default: it is
 * one of the two answers, and asserting it would be making the owner's claim for
 * them. A registration number is the other.
 *
 * Set it only on advice:
 *
 *     export const REGISTRATION_STATUS: string | null = 'Not a SEBI-registered research analyst';
 *     // or
 *     export const REGISTRATION_STATUS: string | null = 'SEBI Research Analyst — INH000000000';
 */
export const REGISTRATION_STATUS: string | null = null;

/**
 * The disclosure line the site already publishes, and the one piece of this that
 * needs no decision: it is the same position as the per-article disclaimer added
 * in 7.4 and as `/disclaimer` itself.
 */
export const NOT_ADVICE = 'Educational research, not investment advice.';

/** Fills `{model}` in AI_DISCLOSURE. Returns null when nothing is to be shown. */
export function aiDisclosureFor(model?: string): string | null {
  if (!AI_DISCLOSURE) return null;
  return AI_DISCLOSURE.replace('{model}', model ?? 'an AI model');
}

/**
 * The one author name. Invariant 3.9: "StocksFundamentals" and "Pulkit Goel",
 * because four brand spellings and two author names were once in use and entity
 * consolidation in Google and in AI systems depends on one consistent name.
 *
 * Mirrors AUTHOR_NAME in scripts/generate-og-files.py, which writes it into the
 * `<meta name="author">` and the JSON-LD `Person` on every prerendered page. If
 * these two ever disagree, the prerender wins for crawlers and this wins for
 * readers, which is exactly the split 3.9 exists to prevent.
 */
export const AUTHOR_NAME = 'Pulkit Goel';
