#!/usr/bin/env python3
"""Build the data files shipped inside the Vineyard City Content plugin.

  python3 -I scripts/build_city_data.py

Reads : content/manifest.json, content/*.html, content/menu.json, content/media.csv, scripts/data/*.json
Writes: plugin/vineyard-city-content/data/seed.json   (settings, quick links, tiles, events, "Related Pages" menus, home blocks)
        plugin/vineyard-city-content/data/pages.json  (per existing page: CLEAN html + contact box + buttons + banner + breadcrumb parent …)

The page HTML is made theme-independent: Revize wrappers/editor chrome removed, document lists turned into native
<details> groups, dead Revize forms replaced by Jetpack contact forms, old links rewritten to the new URLs.
"""
import csv, html as htmllib, json, re, sys
import urllib.parse as up
from pathlib import Path
from bs4 import BeautifulSoup, Comment, NavigableString

ROOT = Path(__file__).resolve().parent.parent
PLUGIN = ROOT / "plugin" / "vineyard-city-content" / "data"
HOSTS = {"www.vineyardutah.gov", "vineyardutah.gov", "www.vineyardutah.org", "vineyardutah.org", "cms3.revize.com"}
FILES = "/wp-content/themes/vineyard/files"           # where deploy/site serves the documents
ASSETS = "/wp-content/themes/vineyard/_assets_"        # theme assets of the first theme (logo etc.)
manifest = json.load(open(ROOT / "content" / "manifest.json"))
media = {r["old_path"] for r in csv.DictReader(open(ROOT / "content" / "media.csv", newline="", encoding="utf-8"))}
page_map = {m["old_path"]: m["new_path"] for m in manifest}
for m in manifest:
    if m["old_path"].endswith("/index.php"):
        page_map[m["old_path"][:-len("index.php")]] = m["new_path"]
by_old = {m["old_path"]: m for m in manifest}
qenc = lambda p: "/".join(up.quote(s, safe="") for s in p.split("/"))


def map_url(u):
    """Old site URL -> new root-relative URL (pages, files). Returns (new_url, kind) or (None, None) for external/unknown."""
    u = htmllib.unescape((u or "").strip())
    if not u or re.match(r"^(mailto:|tel:|javascript:|data:|#)", u, re.I):
        return None, None
    p = up.urlparse(u)
    if p.netloc and p.netloc.lower() not in HOSTS:
        return None, None
    path = up.unquote(p.path)
    path = re.sub(r"^/?revize/vineyard/", "", path).lstrip("/")
    while path.startswith(("./", "../")):
        path = path[2:] if path.startswith("./") else path[3:]
    frag = ("#" + p.fragment) if p.fragment else ""
    if path in ("", "index.php", "index.html"):
        return "/" + frag, "page"
    if path in page_map:
        return "/" + page_map[path] + frag, "page"
    if path in media:
        return FILES + "/" + qenc(path) + frag, "file"
    if path in ("calendar.php",):
        return "/calendar/" + frag, "page"
    return None, None


def rewrite_html(soup):
    for tag in soup.find_all(True):
        for attr in ("href", "src", "data-src", "poster"):
            if tag.has_attr(attr):
                new, _ = map_url(tag[attr])
                if new:
                    tag[attr] = new
        if tag.has_attr("style") and "url(" in tag["style"]:
            tag["style"] = re.sub(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", lambda m: "url(%s)" % (map_url(m.group(1))[0] or m.group(1)), tag["style"])


# ------------------------------------------------------------------ document lists -> native <details>
def convert_document_center(soup):
    dc = soup.select_one("#document-center")
    if dc is None:
        return
    def group(cat):
        head = cat.find(["h3", "h4"], class_="docs-toggle")
        title = head.find(string=True, recursive=False) if head else ""
        title = (title or "").strip() or (head.get_text(" ", strip=True) if head else "Documents")
        small = head.find("small") if head else None
        count = small.get_text(strip=True) if small else ""
        d = soup.new_tag("details", attrs={"class": "docs-group"})
        s = soup.new_tag("summary"); s.string = title
        if count:
            sm = soup.new_tag("small"); sm.string = count; s.append(sm)
        d.append(s)
        direct_ul = None
        for ul in cat.find_all("ul", class_="file-group", recursive=True):
            if ul.find_parent(class_="inner-cat") is cat or (ul.find_parent(class_="cat") is cat):
                direct_ul = ul
        for inner in cat.select(":scope > .inner-cat-wrap > .inner-cat, :scope > .inner-cat"):
            d.append(group(inner))
        lists = [ul for ul in cat.find_all("ul", class_="file-group") if ul.find_parent(class_="cat") is cat]
        for ul in lists:
            nul = soup.new_tag("ul")
            for li in ul.find_all("li", recursive=False):
                a = li.find("a", href=True)
                if not a:
                    continue
                for sp in a.find_all("span"):
                    sp.decompose()
                nli = soup.new_tag("li"); na = soup.new_tag("a", href=a["href"])
                na.string = a.get_text(" ", strip=True)
                if a.get("target") == "_blank":
                    na["target"] = "_blank"; na["rel"] = "noopener"
                nli.append(na); nul.append(nli)
            d.append(nul)
        return d
    wrap = soup.new_tag("div", attrs={"class": "docs-list"})
    for cat in dc.select("#categorties-wrap > .outer-cat"):
        wrap.append(group(cat))
    dc.replace_with(wrap)


# ------------------------------------------------------------------ forms
def opts(sel):
    return [o.get_text(strip=True) for o in sel.find_all("option") if o.get_text(strip=True)]


def f(label, kind="text", req=False, options=None):
    return {"label": label, "type": kind, "required": req, "options": options or []}


FORMS = {  # old_path -> (subject, [fields]); neighborhood list for parking is read from the page itself
    "community_/join_the_arch_commission.php": ("Join the ARCH Commission", [f("Name", "name", 1), f("Email Address", "email", 1), f("Reason for wanting to join", "textarea")]),
    "community_/join_the_atc.php": ("Join the Active Transportation Commission", [f("Name", "name", 1), f("Email Address", "email", 1), f("Reason for wanting to join", "textarea")]),
    "community_/join_the_library_board.php": ("Join the Library Board", [f("Name", "name", 1), f("Email Address", "email", 1), f("Reason for wanting to join", "textarea")]),
    "community_/join_the_youth_council.php": ("Express Interest in the Vineyard Youth Council", [
        f("Name", "name", 1), f("Parent Phone Number", "telephone", 1), f("Parent/Youth Email", "email", 1),
        f("Are you between the ages 12 and 18?", "radio", 1, ["Yes", "No", "Yes - applying for my child"]),
        f("Are you a Vineyard Resident?", "radio", 1, ["Yes", "No"]),
        f("Are you able to attend monthly VYC meetings?", "radio", 0, ["Yes", "Some", "No"]),
        f("Are you able to attend events?", "radio", 0, ["Yes", "Some", "No"])]),
    "community_/vineyard_community_garden.php": ("Community Garden interest", [f("Name", "name"), f("Email", "email"), f("Phone Number", "telephone")]),
    "community_/volunteer.php": ("Volunteer application", [
        f("First Name", "text", 1), f("Last Name", "text", 1), f("Age", "text", 1), f("Phone Number", "telephone", 1), f("Email Address", "email", 1),
        f("What types of service are you most interested in?", "textarea", 1),
        f("Are you a Vineyard resident?", "radio", 1, ["Yes", "No"]),
        f("What type of role would you like?", "checkbox-multiple", 1, ["Organizer/ Committee Member", "Volunteer at Events"]),
        f("Is there anything else we need to know?", "textarea")]),
    "government/parking.php": ("Parking Permit Program Petition", None),
    "government/request_a_meeting_with_the_mayor.php": ("Meeting with the Mayor request", [
        f("Name", "name", 1), f("Email Address", "email", 1), f("Phone Number", "telephone", 1), f("Organization"), f("Number of attendees"),
        f("Names and titles of attendees", "textarea"), f("Reason for meeting", "text", 1),
        f("How time-sensitive is the issue?", "radio", 1, ["Not at all", "Somewhat", "Very"])]),
    "government/stormwater___floodplain_management/stormwater_management/stormwater_management_program.php": ("Stormwater comment", [
        f("Name", "name"), f("Email", "email"), f("Neighborhood"), f("Comment", "textarea")]),
    "government/traffic_calming.php": ("Traffic Calming request", [
        f("Name", "name", 1), f("Phone Number", "telephone", 1), f("Email Address", "email", 1), f("Address", "textarea"), f("Concern(s)", "textarea", 1),
        f("Have you contacted law enforcement and alerted them of your concern?", "select", 1, ["Yes", "No"])]),
    "government/water_meter_request.php": ("Water Meter Request / Water Utility Agreement", [
        f("Permit #", "text", 1), f("Address", "text", 1), f("Subdivision", "text", 1), f("Lot #", "text", 1), f("Contractor", "text", 1),
        f("Is this a landscape/irrigation meter?", "radio", 1, ["Yes", "No"]),
        f("Billing Contact", "text", 1), f("Phone Number", "telephone", 1), f("Email", "email", 1), f("Mailing Address", "text", 1),
        f("Signature (type your name)", "text", 1), f("Date", "date", 1)]),
}
ADDED_FORMS = {  # pages that had no working form: a simple one is appended (marked as an addition in the README)
    "contact/index.php": ("Message from the website contact form", [f("Name", "name", 1), f("Email", "email", 1), f("Phone", "telephone"), f("How can we help?", "textarea", 1)]),
    "government/records_request.php": ("GRAMA records request", [f("Name", "name", 1), f("Email", "email", 1), f("Phone", "telephone"), f("Describe the records you are requesting", "textarea", 1),
                                                                 f("How would you like to receive them?", "select", 0, ["Email", "Pick up at City Hall", "Mail"])]),
    "community_/report-a-concern.php": ("Report a concern", [f("Name", "name"), f("Email", "email"), f("Phone", "telephone"), f("Where is the concern (address or nearest cross streets)?", "text", 1), f("Describe the concern", "textarea", 1)]),
}


def jetpack_form(subject, fields):
    out = ['[contact-form subject="%s" submit_button_text="Submit"]' % subject.replace('"', "'")]
    for fl in fields:
        a = 'label="%s"' % fl["label"].replace('"', "'")
        if fl["required"]:
            a += ' required="1"'
        if fl["options"]:
            a += ' options="%s"' % ",".join(o.replace(",", ";").replace('"', "'") for o in fl["options"])
        out.append('[contact-field %s type="%s"/]' % (a, fl["type"]))
    out.append("[/contact-form]")
    return "\n".join(out)


def replace_forms(soup, old_path):
    form = soup.find("form", attrs={"name": "formwizard"})
    spec = FORMS.get(old_path)
    if form is None and old_path not in ADDED_FORMS:
        return None
    if form is not None:
        subject, fields = spec
        if fields is None:  # parking: read neighborhoods from the dead form
            sel = [s for s in form.find_all("select") if "Neighborhood" in (s.get("name") or "")][0]
            fields = [f("Name", "name", 1), f("Address", "text", 1), f("Please select the neighborhood you live in", "select", 1, opts(sel)),
                      f('Have you read the "Overnight Parking Program" document?', "select", 1, ["Yes", "No"]),
                      f("Select one of the following", "select", 1, ["You DO want to implement a parking permit program in your neighborhood", "You do NOT want to implement a parking permit program in your neighborhood"])]
        # keep the explanatory text that lived inside the form (everything that is not a field row)
        keep = []
        for ch in list(form.children):
            if getattr(ch, "name", None) is None:
                continue
            if ch.find(["input", "select", "textarea", "button"]) or ch.name in ("input", "select", "textarea", "button"):
                for sub in ch.find_all(["p", "h2", "h3", "h4"], recursive=True):
                    if not sub.find(["input", "select", "textarea", "label"]) and sub.get_text(strip=True) and len(sub.get_text(strip=True)) > 60:
                        keep.append(sub)
                continue
            txt = ch.get_text(" ", strip=True)
            if txt and len(txt) > 25 and "Edit Form" not in txt and not ch.find("a", href=re.compile(r"revize\.com/forms")):
                keep.append(ch)
        for k in form.find_all(["script", "style"]):
            k.decompose()
        holder = soup.new_tag("div")
        for k in keep:
            if k.name in ("div", "section", "fieldset"):
                for c in list(k.children):
                    holder.append(c.extract())
            else:
                holder.append(k.extract())
        holder.append(NavigableString("\n" + jetpack_form(subject, fields) + "\n"))
        form.replace_with(holder)
        holder.unwrap()
        return subject
    subject, fields = ADDED_FORMS[old_path]
    root = soup.body or soup
    h = soup.new_tag("h2"); h.string = {"contact/index.php": "Send us a message", "government/records_request.php": "Submit a records request online",
                                       "community_/report-a-concern.php": "Report a concern online"}[old_path]
    root.append(h)
    root.append(NavigableString("\n" + jetpack_form(subject, fields) + "\n"))
    return subject


# ------------------------------------------------------------------ per page cleaning
def clean_page(m):
    old = m["old_path"]
    raw = (ROOT / "content" / m["content_file"]).read_text(encoding="utf-8")
    soup = BeautifulSoup(raw, "lxml")
    body = soup.body or soup
    for el in body.find_all(["script", "style", "noscript"]):
        el.decompose()
    for c in body.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    for sel in (".rz-doc-center-hash", ".rz-doc-center-sub-hash", ".add-file", ".rz-sort-options", "#doc-search-form", ".doc-center-header", "#doc-center-header", "button.rz-doc-search-reset"):
        for el in body.select(sel):
            el.decompose()
    for el in body.find_all(class_=re.compile(r"(^|[-_ ])edit($|[-_ ])|-edit\b")):   # empty "edit button" holders left by the old CMS
        if not el.get_text(strip=True) and not el.find(["img", "a", "iframe"]):
            el.decompose()
    form_subject = replace_forms(soup, old)
    convert_document_center(soup)
    # drop the Revize "#post" wrapper (the theme supplies its own wrapper)
    for w in body.select("#post"):
        w.unwrap()
    for el in body.find_all(attrs={"class": re.compile(r"\brz[A-Za-z-]*\b")}):
        pass
    rewrite_html(soup)
    # remove empty wrappers
    for d in body.find_all("div"):
        if not d.get_text(strip=True) and not d.find(["img", "a", "iframe", "table", "details", "ul", "ol"]) and not d.attrs.get("class") and not d.attrs.get("id"):
            d.decompose()
    html = body.decode_contents().strip()
    def _txt_url(mm):
        pth = up.unquote(mm.group(1)).replace("&amp;", "&")
        return (FILES + "/" + qenc(pth)) if pth in media else mm.group(0)
    html = re.sub(r"https://cms3\.revize\.com/revize/vineyard/([^\s<\"']+)", _txt_url, html)
    html = re.sub(r"\n{3,}", "\n\n", html)
    # Jetpack shortcodes must sit on their own lines inside a shortcode block so the block editor shows them cleanly
    html = re.sub(r"(\[contact-form .*?\[/contact-form\])", lambda mm: "<!-- wp:shortcode -->\n" + mm.group(1) + "\n<!-- /wp:shortcode -->", html, flags=re.S)
    return html, form_subject


def contact_box(m):
    cb = m["meta"].get("vc_contact_box")
    if not cb:
        return None
    s = BeautifulSoup(cb, "lxml")
    a = s.select_one("a.contact-link")
    return {"title": (s.select_one(".box-header") or s).get_text(" ", strip=True) if s.select_one(".box-header") else "",
            "text": s.select_one(".contact-details").get_text(" ", strip=True) if s.select_one(".contact-details") else "",
            "phone": a.get_text(strip=True) if a else "", "phone_href": a["href"] if a else ""}


def buttons(m):
    ib = m["meta"].get("vc_inner_buttons")
    if not ib:
        return []
    out = []
    for a in BeautifulSoup(ib, "lxml").find_all("a", href=True):
        new, _ = map_url(a["href"])
        out.append({"label": a.get_text(" ", strip=True), "url": new or a["href"], "new_tab": a.get("target") in ("_blank", "_new"), "icon": bool(a.find("img"))})
    return out


def banner(m):
    imgs = json.loads(m["meta"].get("vc_banner_images", "[]"))
    for u in imgs:
        p = up.unquote(u.split("?")[0]).lstrip("/")
        if p in media:
            return p
    return None


def flyout_items(ul):
    out = []
    for li in ul.find_all("li", recursive=False):
        a = li.find("a", recursive=False)
        if not a:
            continue
        new, _ = map_url(a["href"])
        node = {"title": a.get_text(" ", strip=True), "url": new or a["href"], "new_tab": a.get("target") in ("_blank", "_new"), "children": []}
        sub = li.find("ul", recursive=False)
        if sub:
            node["children"] = flyout_items(sub)
        out.append(node)
    return out


def main():
    pages, menus, menu_key = {}, [], {}
    names_used = set()
    for m in manifest:
        html, form = clean_page(m)
        entry = {"title": m["title"], "html": html, "contact": contact_box(m), "buttons": buttons(m), "banner": banner(m),
                 "template": "template-fullwidth.php" if m["meta"].get("vc_layout") == "full" else "", "slug": m["slug"], "form": form,
                 "menu_order": m["menu_order"],
                 "parent_old": next((x["old_path"] for x in manifest if m["parent"] and x["slug"] == m["parent"] and not x["parent"]), "")}
        ln = m["meta"].get("vc_leftnav")
        if ln:
            ul = BeautifulSoup(ln, "lxml").select_one("#flyout")
            items = flyout_items(ul) if ul else []
            if items:
                key = json.dumps(items, sort_keys=True)
                if key not in menu_key:
                    base = "Related Pages: " + items[0]["title"]
                    name, n = base, 2
                    while name in names_used:
                        name = f"{base} ({n})"; n += 1
                    names_used.add(name); menu_key[key] = name
                    menus.append({"name": name, "items": items})
                entry["related_menu"] = menu_key[key]
        pages[m["old_path"]] = entry
    # ---- breadcrumbs: automatic = Home > top-level section (WP parent) > page. Where the old trail differs, remember the
    # page it sat under ("Show this page under") so the trail is rebuilt by the theme from real page links.
    def auto_trail(old, override):
        trail, seen, cur = [], set(), old
        while cur and cur not in seen:
            seen.add(cur); trail.append(cur)
            nxt = override.get(cur) or (next((x["old_path"] for x in manifest if x["slug"] == by_old[cur]["parent"] and not x["parent"]), None) if by_old[cur]["parent"] else None)
            cur = nxt
        return list(reversed(trail))
    override, ok = {}, 0
    norm = lambda t: re.sub(r"\s+", " ", t.replace("\xa0", " ")).strip().lower()
    for m in manifest:
        cr = m["meta"].get("vc_breadcrumbs")
        if not cr:
            continue
        orig = json.loads(cr)
        want = [norm(c["title"]) for c in orig][1:]                    # without "Home"
        pred = [norm(by_old[o]["title"]) for o in auto_trail(m["old_path"], override)]
        if pred != want and len(orig) >= 2 and orig[-2].get("url"):
            new, kind = map_url(orig[-2]["url"])
            po = None
            p = up.unquote(up.urlparse(orig[-2]["url"]).path).lstrip("/")
            p = p if p in by_old else (p + "index.php" if p.endswith("/") and p + "index.php" in by_old else None)
            if p and p != m["old_path"]:
                override[m["old_path"]] = p
    for m in manifest:
        cr = m["meta"].get("vc_breadcrumbs")
        if not cr:
            continue
        want = [norm(c["title"]) for c in json.loads(cr)][1:]
        pred = [norm(by_old[o]["title"]) for o in auto_trail(m["old_path"], override)]
        ok += pred == want
        if m["old_path"] in override:
            pages[m["old_path"]]["crumb_parent"] = override[m["old_path"]]
    total_c = sum(1 for m in manifest if m["meta"].get("vc_breadcrumbs"))
    print(f"breadcrumbs reproduced automatically: {ok}/{total_c} (overrides set on {len(override)} pages)")

    # ---- home page seed (quick links, tiles, events)
    home = json.load(open(ROOT / "scripts" / "data" / "home_parts.json"))
    def img_ref(u):
        u = u.split("?")[0]
        p = up.unquote(up.urlparse(u).path).lstrip("/")
        if p.startswith("_assets_/"):
            return {"asset": p[len("_assets_/"):]}
        return {"file": p}
    def link_of(u):
        new, _ = map_url(u)
        if new:
            return new
        return u.replace("http://", "https://")
    ql = []
    for href, tgt, img, title in home["ql"]:
        t = re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", "|", title))).strip()
        parts = [x.strip() for x in t.split("|") if x.strip()]
        ql.append({"title": parts[0], "title2": parts[1] if len(parts) > 1 else "", "url": link_of(href), "new_tab": tgt == "_blank", "image": img_ref(img)})
    tiles = [{"title": re.sub(r"\s+", " ", htmllib.unescape(name)).strip(), "url": link_of(href), "new_tab": tgt == "_blank", "image": img_ref(img)} for href, tgt, img, name in home["sub"]]
    feed = json.load(open(ROOT / "scripts" / "data" / "calendar-feed.json"))
    cat_names = {"1": "Meetings", "2": "Recreation", "3": "Community", "4": "Utilities", "6": "Library"}
    events = []
    for e in sorted(feed, key=lambda e: e["start"]):
        if e["start"] < "2026-11-09":
            continue
        events.append({"title": e["title"], "start": e["start"], "end": e.get("end", ""), "location": e.get("location", ""), "description": up.unquote(e.get("desc", "")),
                       "categories": [cat_names[c] for c in e["calendar_displays"] if c in cat_names]})
    # two upcoming meetings that the live calendar pulls from an external (Google) feed; time/location not available in the mirror
    events += [{"title": "City Council Meeting", "start": "2026-11-10T00:00:00", "end": "", "location": "", "description": "", "categories": ["Meetings"], "all_day": True},
               {"title": "Active Transportation Commission Meeting", "start": "2026-11-12T00:00:00", "end": "", "location": "", "description": "", "categories": ["Meetings"], "all_day": True}]
    events.sort(key=lambda e: e["start"])
    seed = {
        "settings": {
            "logo": {"asset": "images/logo.png"}, "search_placeholder": "Search ...", "menu_image_2": {"file": "revize_photo_gallery/_DSC4715 - Copy.jpg"}, "menu_image_3": {"file": "Headshots/IMG_1037 - Copy.jpg"},
            "footer_logo": {"asset": "images/footer-logo.png"}, "phone": "801.226.1929", "address_line1": "125 S Main Street", "address_line2": "Vineyard, UT",
            "address_link": "https://goo.gl/maps/cw4EoARDeM4t7DYr5", "hours_line1": "Monday - Thursday: 8am – 5pm", "hours_line2": "Friday: 8am – 12pm", "copyright": "© Vineyard UT",
            "facebook": "https://www.facebook.com/vineyardcity", "instagram": "https://www.instagram.com/vineyardcity", "twitter": "https://www.Twitter.com/vineyardcity",
            "hero_logo": {"file": "revize_photo_gallery/slider-logo.png"}, "hero_button_label": "Transparency Portal", "hero_button_url": "/transparency-portal/",
            "events_small": "CHECK OUT OUR", "events_title": "UPCOMING EVENTS", "events_button_label": "See All Events", "events_button_url": "/calendar/",
            "social_small": "EXPLORE OUR", "social_title": "SOCIAL MEDIA", "newsletter_small": "SIGN UP FOR OUR", "newsletter_title": "NEWSLETTER",
            "newsletter_placeholder": "Your information here...", "newsletter_button": "Go", "newsletter_action": "/community/newsletters/",
        },
        "home_banner": {"file": up.unquote(home["slider"].split("?")[0])},
        "quicklinks": ql, "tiles": tiles, "events": events, "related_menus": menus,
        "categories": [{"name": "Meetings", "color": "#114a76"}, {"name": "Recreation", "color": "#087968"}, {"name": "Community", "color": "#fcb215"},
                       {"name": "Utilities", "color": "#4e606f"}, {"name": "Library", "color": "#cc3232"}],
        "home_content": "<!-- wp:vineyard-city-content/quick-links /-->\n\n<!-- wp:vineyard-city-content/events /-->\n\n<!-- wp:vineyard-city-content/photo-tiles /-->\n\n<!-- wp:vineyard-city-content/social /-->\n\n<!-- wp:vineyard-city-content/newsletter /-->",
        "calendar_pages": ["calendar.php", "government/events.php", "community_/events.php"],
        "calendar_block": "<!-- wp:vineyard-city-content/events-calendar /-->",
    }
    PLUGIN.mkdir(parents=True, exist_ok=True)
    (PLUGIN / "seed.json").write_text(json.dumps(seed, indent=1, ensure_ascii=False), encoding="utf-8")
    (PLUGIN / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    nf = sum(1 for p in pages.values() if p["form"])
    print(f"pages: {len(pages)} | contact boxes: {sum(1 for p in pages.values() if p['contact'])} | pages with buttons: {sum(1 for p in pages.values() if p['buttons'])} | "
          f"banners: {sum(1 for p in pages.values() if p['banner'])} | related menus: {len(menus)} | forms: {nf} | quick links {len(ql)}, tiles {len(tiles)}, events {len(events)}")
    print("forms:", [(k, v["form"]) for k, v in pages.items() if v["form"]])


if __name__ == "__main__":
    main()
