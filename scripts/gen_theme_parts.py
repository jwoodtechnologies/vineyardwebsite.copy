#!/usr/bin/env python3
"""Generate theme template parts that are copied verbatim from the live homepage markup
(share modal + 100-language translate list), swapping absolute URLs for WordPress helpers.
Usage: gen_theme_parts.py <source/www.vineyardutah.gov/index.html.orig> <theme/vineyard>
"""
import re, sys, pathlib

src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
theme = pathlib.Path(sys.argv[2])

m = re.search(r'<div id="share-translate">.*?</ul><!--/#translation-links-->\s*</div><!-- /#share-translate -->', src, re.S)
if not m:
    sys.exit("share-translate block not found")
blk = m.group(0)

# drop the Revize "ENABLERS" comment and third-party userway snippet (handled in functions.php)
blk = re.sub(r'<!-- ENABLERS.*?-->', '', blk)
blk = re.sub(r'<script>\s*\(function\(d\)\{.*?</script>\s*<noscript>.*?</noscript>', '', blk, flags=re.S)

cur = "<?php echo esc_url( get_permalink() ?: home_url( '/' ) ); ?>"
blk = blk.replace('&lt;a href="http://www.vineyardutah.gov/">', '&lt;a href="<?php echo esc_url( $vc_url ); ?>">')
blk = re.sub(r'(sharer\.php\?u=|intent/tweet\?url=|submit\?url=)http://www\.vineyardutah\.gov/', r'\1<?php echo rawurlencode( $vc_url ); ?>', blk)
blk = re.sub(r'https://www\.vineyardutah\.gov/_assets_/images/([\w.-]+)', r"<?php echo esc_url( vineyard_asset( 'images/\1' ) ); ?>", blk)
assert 'vineyardutah.gov' not in blk, re.findall(r'.{40}vineyardutah\.gov.{40}', blk)[:3]

out = "<?php\n/** Share modal + translate list (verbatim from original markup). */\nif ( ! defined( 'ABSPATH' ) ) { exit; }\n$vc_url = is_singular() ? get_permalink() : home_url( '/' );\n?>\n" + blk + "\n"
(theme / "template-parts").mkdir(parents=True, exist_ok=True)
(theme / "template-parts" / "share-translate.php").write_text(out, encoding="utf-8")
print("wrote share-translate.php", len(out))
