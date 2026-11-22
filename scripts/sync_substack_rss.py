#!/usr/bin/env python3
"""Read the public Notes RSS feed and merge original notes into the site cache."""

import argparse
from datetime import timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.error import URLError
from urllib.request import Request, urlopen
from xml.etree import ElementTree

from sync_substack_notes import FeedError, write_notes

FEED = "https://openrss.org/feed/substack.com/@rajadhanda"
NOTE_LINK = re.compile(r"https://substack\.com/@rajadhanda/note/c-\d+")
AUTHOR = "{http://purl.org/dc/elements/1.1/}creator"
MAX_FEED_BYTES = 2 * 1024 * 1024


class NoteText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)

    def handle_starttag(self, tag, attrs):
        if tag == "br":
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag == "p":
            self.parts.append("\n\n")

    def text(self):
        paragraphs = (part.strip() for part in "".join(self.parts).split("\n\n"))
        return "\n\n".join(
            part for part in paragraphs if part and not part.startswith("- Raja Dhanda (@rajadhanda)")
        )


def read_notes(xml):
    if len(xml) > MAX_FEED_BYTES or b"<!DOCTYPE" in xml.upper():
        raise FeedError("Unexpected RSS document")
    feed = ElementTree.fromstring(xml)
    if feed.tag != "rss" or feed.find("channel") is None:
        raise FeedError("Expected an RSS channel")
    notes = {}
    for item in feed.findall("channel/item"):
        link = (item.findtext("link") or "").strip()
        title = (item.findtext("title") or "").strip()
        author = item.findtext(AUTHOR) or item.findtext("author") or ""
        if not NOTE_LINK.fullmatch(link) or title.startswith(("Restacked", "Commented on")):
            continue
        if author not in {"Raja Dhanda", "noreply@substack.com (rajadhanda)"}:
            continue
        parser = NoteText()
        parser.feed(item.findtext("description") or "")
        parser.close()
        text = parser.text()
        try:
            timestamp = parsedate_to_datetime(item.findtext("pubDate") or "")
            day = timestamp.astimezone(timezone.utc).date().isoformat()
        except (ValueError, OverflowError):
            continue
        if text:
            notes.setdefault(link, {"text": text, "date": day, "link": link})
    if not notes:
        raise FeedError("The RSS feed contained no verified original notes")
    return sorted(notes.values(), key=lambda note: note["date"], reverse=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("blog/notes.json"))
    options = parser.parse_args()
    request = Request(FEED, headers={
        "Accept": "application/rss+xml, application/xml;q=0.9",
        "User-Agent": "RajaDhandaNotesSync/2.0 (+https://rajadhanda.me/)",
    })
    with urlopen(request, timeout=25) as response:
        latest = read_notes(response.read(MAX_FEED_BYTES + 1))
    existing = json.loads(options.output.read_text()) if options.output.exists() else []
    if not isinstance(existing, list) or any(not isinstance(note, dict) or not {"text", "date", "link"} <= note.keys() for note in existing):
        raise FeedError("Invalid existing notes cache")
    known_links = {note["link"] for note in existing}
    additions = [note for note in latest if note["link"] not in known_links]
    merged = sorted(additions + existing, key=lambda note: note["date"], reverse=True)
    if additions:
        write_notes(options.output, merged)
    print(f"Verified {len(latest)} RSS notes, latest {latest[0]['date']}; {len(additions)} new to the cache.")


if __name__ == "__main__":
    try:
        main()
    except (FeedError, URLError, OSError, ValueError, ElementTree.ParseError) as error:
        sys.exit(f"Notes sync failed. The previous cache is safe. {error}")
