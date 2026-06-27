#!/usr/bin/env python3.12
"""
Convert existing HTML analysis articles to Markdown for React app.
Uses existing Obsidian markdown where available.
"""

import os
import re
import json
import html2text

BASE_DIR = '/var/www/stock-analyses'
REACT_DIR = '/var/www/stock-analyses-react'
OBSIDIAN_DIR = '/home/azureuser/Documents/Obsidian'
ANALYSES_FILE = os.path.join(BASE_DIR, 'analyses.json')

# Mapping: HTML file → Obsidian markdown file (where available)
OBSIDIAN_MAP = {
    'us-market-crash-jun23.html': 'Market Analysis/US Market Crash - Jun 23 2026.md',
    'market-crash-jun23.html': 'Market Analysis/Market Crash Analysis - Jun 23 2026.md',
    'ace-deep-dive-jun23.html': 'Investments/Companies/ACE-Deep-Dive-Corrected.md',
    'it-stocks-bloodbath-jun19.html': 'Research/Markets/IT-Stocks-Bloodbath-June-19-2026.md',
    'ideaforge-deep-dive-jun18.html': 'Investments/Companies/Ideaforge-Deep-Dive-Jun18.md',
    'palantir-pltr-deep-dive-jun18.html': 'Investments/Companies/Palantir-PLTR-Deep-Dive-Jun18.md',
    'cg-power-deep-dive-jun18.html': 'Investments/Companies/CG-Power-Deep-Dive-Jun18.md',
    'kaynes-technology-deep-dive-jun18.html': 'Investments/Companies/Kaynes-Technology-Deep-Dive-Jun18.md',
    'kaynes-cg-power-deep-dive-jun18.html': 'Investments/Companies/Kaynes-CG-Power-Deep-Dive-Jun18.md',
    'reliance-deep-dive-jun17.html': 'Investments/Earnings/2026-06-17-reliance-deep-dive.md',
    'trent-deep-dive-jun17.html': 'Investments/Companies/Trent - Deep Dive Analysis 17Jun2026.md',
    'pltr-why-falling-jun26.html': 'Stock Analysis/PLTR - Why Falling & What To Do (Jun 26, 2026).md',
    'fii-dii-institutional-attraction-june25.html': 'Inbox/FII-DII-Institutional-Attraction-June25-2026.md',
    'institutional-gems-weekly-jun25.html': 'Inbox/Institutional-Gems-Weekly-Jun19-25-2026.md',
    'amd-deep-dive-jun17.html': None,
    'hcltech-sarvam-ai-acquisition.html': None,
    'nalco-down-root-cause-jun16.html': None,
    'netweb-technologies-deep-dive.html': None,
}


def clean_obsidian_md(content, html_file, analysis):
    """Clean Obsidian markdown for public use - strip frontmatter, add proper title."""
    # Remove YAML frontmatter if present
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)

    # Ensure title is present
    if not content.startswith('# '):
        content = f'# {analysis["title"]}\n\n' + content

    # Remove Obsidian-style tags like #PLTR and replace with plain tags
    content = re.sub(r'#[A-Za-z0-9_-]+', '', content)

    # Add model info line if not present
    if 'deepseek-chat' not in content:
        lines = content.split('\n')
        insert_pos = 0
        for i, line in enumerate(lines[:10]):
            if line.startswith('---') or line.startswith('# '):
                insert_pos = i + 2
                break
        lines.insert(insert_pos, f'*Analysis by deepseek-chat*\n')
        content = '\n'.join(lines)

    return content.strip()


def html_to_md(html_path, analysis):
    """Convert standalone HTML analysis to Markdown using html2text."""
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract main content - everything between <main> or <div class="article-container">
    main_match = re.search(r'<main>(.*?)</main>', html, re.DOTALL)
    if main_match:
        body_html = main_match.group(1)
    else:
        body_match = re.search(r'<body>(.*?)</body>', html, re.DOTALL)
        body_html = body_match.group(1) if body_match else html

    # Remove header nav content
    body_html = re.sub(r'<header>.*?</header>', '', body_html, flags=re.DOTALL)
    body_html = re.sub(r'<div class="article-container">', '', body_html)

    # Convert tables to markdown-friendly format
    # html2text handles this, but let's clean up any remaining nav/footer
    body_html = re.sub(r'<footer>.*?</footer>', '', body_html, flags=re.DOTALL)

    # Use html2text for conversion
    h = html2text.HTML2Text()
    h.body_width = 0  # No wrapping
    h.ignore_links = False
    h.ignore_images = False
    h.ignore_emphasis = False
    h.protect_links = True
    h.unicode_snob = True
    h.skip_internal_links = False
    h.inline_links = True
    h.escape_snob = True

    md = h.handle(body_html)

    # Clean up
    md = re.sub(r'\n{4,}', '\n\n', md)
    md = md.strip()

    return md


def main():
    os.makedirs(os.path.join(REACT_DIR, 'public', 'analyses'), exist_ok=True)

    with open(ANALYSES_FILE, 'r') as f:
        data = json.load(f)

    converted = 0
    from_obsidian = 0
    from_html = 0

    for analysis in data['analyses']:
        html_file = analysis['file']
        slug = html_file.replace('.html', '')
        md_path = os.path.join(REACT_DIR, 'public', 'analyses', f'{slug}.md')

        md_content = None

        # Check if we have an Obsidian source
        obsidian_rel = OBSIDIAN_MAP.get(html_file)
        if obsidian_rel:
            obsidian_path = os.path.join(OBSIDIAN_DIR, obsidian_rel)
            if os.path.exists(obsidian_path):
                with open(obsidian_path, 'r', encoding='utf-8') as f:
                    md_content = clean_obsidian_md(f.read(), html_file, analysis)
                from_obsidian += 1
                print(f"✅ {html_file} → Obsidian ({obsidian_rel})")
            else:
                print(f"⚠️  Obsidian file not found: {obsidian_path}")
        else:
            print(f"📄 {html_file} → No Obsidian mapping")

        # Fallback: convert from HTML
        if md_content is None or len(md_content) < 50:
            html_path = os.path.join(BASE_DIR, html_file)
            if os.path.exists(html_path):
                md_content = html_to_md(html_path, analysis)
                from_html += 1
                print(f"   - Converted from HTML")
            else:
                print(f"   ❌ HTML file not found: {html_path}")
                # Create minimal placeholder
                md_content = f'# {analysis["title"]}\n\n*Content will be available soon.*\n'

        # Use headline content if converted content is too short
        if md_content is None or len(md_content) < 100:
            md_content = f'# {analysis["title"]}\n\n**Ticker:** {analysis["ticker"]}  \n**Date:** {analysis["date"]}\n\n{analysis.get("summary", "")}'

        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)

        converted += 1

    print(f"\n{'='*50}")
    print(f"Total: {converted} articles converted")
    print(f"  From Obsidian: {from_obsidian}")
    print(f"  From HTML:     {from_html}")
    print(f"{'='*50}")


if __name__ == '__main__':
    main()
