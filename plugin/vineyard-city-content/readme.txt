=== Vineyard City Content ===
Contributors: vineyardcity
Requires at least: 6.3
Tested up to: 6.8
Stable tag: 1.0.2
License: GPLv2 or later

Keeps the Vineyard City website's own content (header/footer details, home page tiles, quick links, events, alerts) in WordPress itself so it stays when the theme changes.

== Description ==
Adds one menu, "Vineyard Site Content", with Header, Footer, Home page, Quick Links, Photo Tiles, Alerts and Events. Adds blocks (Quick Links, Upcoming Events, Photo Tiles, Social Media Icons, Newsletter Sign-up, Events Calendar and List) and plain boxes on the Edit Page screen (contact box, buttons, Related Pages list). Works with any theme; the Vineyard City theme styles it to match the original website.

== Changelog ==
= 1.0.2 =
* Fix: the home page sections showed as "Your site doesn't include support for this block" in the editor. Every section is now a proper block (block.json + editor script): a labelled card with a live preview, a help line and an "Edit these items" button.
* New blocks: Home Banner (photo, logo, button) and Alerts, so every part of the home page can be moved or removed.
* Home page edit screen no longer shows the inner-page boxes (Related Pages, contact box, buttons).
* Automatic one-time update of an unchanged 1.0.1 home page to the new layout (old text kept as a revision).
* Events can be imported through the REST API: event details (_vcc_start, _vcc_end, _vcc_all_day, _vcc_location – the keys the event screen saves) are registered with show_in_rest, writable by users who can edit posts; events support the editor and custom fields in REST; categories at /wp/v2/vc_event_cat.

= 1.0.1 =
* Fix: the home page could end up showing another page's content (the untitled "Business Directory" page that WordPress Importer merged into Home). Page look-ups now never pick the Home page.
* New: "Rebuild the home page sections" button on Start here (keeps the old text as a revision).
* "Tidy the pages" now creates pages the importer merged away, never changes the Home page, and leaves pages that are already tidy (or that you edited) alone.

= 1.0.0 =
First release.
