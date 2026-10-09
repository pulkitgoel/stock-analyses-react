#!/usr/bin/env python3
"""Generate committed brand assets.

  public/og-default.png    1200x630 Open Graph card
  public/favicon.ico       real multi-resolution ICO (16/32/48)
  public/apple-touch-icon.png  180x180

Every analysis page declares twitter:card=summary_large_image. Without an image
asset, each share rendered as a blank card in a slot sized for a large image.

The previous public/favicon.ico was an SVG document with an .ico extension,
served as image/x-icon, which no ICO decoder can read. Its artwork (a rounded
blue square with a white "$") is reproduced here so the real ICO matches
favicon.svg.

This is a one-time asset generator, not part of the build. Run it when the
branding changes:

    python scripts/generate-og-image.py

The outputs are committed, so a build never depends on Pillow being installed.
"""
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
OUT_PATH = os.path.join(PUBLIC_DIR, "og-default.png")
FAVICON_PATH = os.path.join(PUBLIC_DIR, "favicon.ico")
TOUCH_ICON_PATH = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")

# Matches public/favicon.svg.
ICON_BG = (88, 166, 255)
ICON_FG = (255, 255, 255)

WIDTH, HEIGHT = 1200, 630

# Pulled from the site's dark theme so the card matches what a visitor lands on.
BG = (10, 14, 22)
PANEL = (17, 23, 34)
ACCENT = (56, 189, 248)
TEXT = (237, 242, 249)
MUTED = (148, 163, 184)

TITLE = "StocksFundamentals"
TAGLINE = "Deep-dive Indian stock research"
DETAIL = "NSE delivery data  ·  promoter trends  ·  quarterly results"
URL = "stocksfundamentals.online"

# Checked in order. The build machine and a developer machine rarely share fonts,
# so fall back rather than fail.
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "C:/Windows/Fonts/segoeuib.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]
FONT_CANDIDATES_REGULAR = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]


def load_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def render_icon(size):
    """Draw the favicon.svg artwork at one size: rounded blue square, white '$'."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = max(2, round(size * 4 / 32))
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=ICON_BG)

    font = load_font(FONT_CANDIDATES, max(8, round(size * 0.68)))
    # Centre on the glyph's own bounding box, not the font's line box, so the
    # "$" sits visually centred at every size.
    box = draw.textbbox((0, 0), "$", font=font)
    draw.text(
        ((size - (box[2] - box[0])) / 2 - box[0],
         (size - (box[3] - box[1])) / 2 - box[1]),
        "$",
        font=font,
        fill=ICON_FG,
    )
    return img


def write_icons():
    sizes = [16, 32, 48]
    base = render_icon(256)
    base.save(FAVICON_PATH, format="ICO", sizes=[(s, s) for s in sizes])
    print("Wrote %s (ICO %s, %d bytes)" % (
        FAVICON_PATH,
        "/".join(str(s) for s in sizes),
        os.path.getsize(FAVICON_PATH),
    ))

    render_icon(180).convert("RGB").save(TOUCH_ICON_PATH, "PNG", optimize=True)
    print("Wrote %s (180x180, %d bytes)" % (
        TOUCH_ICON_PATH, os.path.getsize(TOUCH_ICON_PATH)))


def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Inset panel, so the card reads as a surface rather than flat colour.
    draw.rounded_rectangle([40, 40, WIDTH - 40, HEIGHT - 40], radius=28, fill=PANEL)

    # Accent rule above the wordmark.
    draw.rounded_rectangle([96, 150, 96 + 88, 150 + 8], radius=4, fill=ACCENT)

    f_title = load_font(FONT_CANDIDATES, 78)
    f_tagline = load_font(FONT_CANDIDATES, 42)
    f_detail = load_font(FONT_CANDIDATES_REGULAR, 26)
    f_url = load_font(FONT_CANDIDATES_REGULAR, 24)

    draw.text((96, 196), TITLE, font=f_title, fill=TEXT)
    draw.text((96, 300), TAGLINE, font=f_tagline, fill=ACCENT)
    draw.text((96, 376), DETAIL, font=f_detail, fill=MUTED)
    draw.text((96, HEIGHT - 40 - 68), URL, font=f_url, fill=MUTED)

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    img.save(OUT_PATH, "PNG", optimize=True)
    print("Wrote %s (%dx%d, %d bytes)" % (
        OUT_PATH, WIDTH, HEIGHT, os.path.getsize(OUT_PATH)))

    write_icons()


if __name__ == "__main__":
    main()
