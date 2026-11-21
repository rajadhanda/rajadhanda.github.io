#!/usr/bin/env python3
"""Refresh the public Notes cache without credentials or third-party services."""

import argparse
from datetime import datetime
import json
import os
from pathlib import Path
import sys
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PROFILE_ID = 43989908
PROFILE_URL = "https://substack.com/@rajadhanda"
# Reader endpoints are also served on the author's public publication host.
FEED_URLS = (
    "https://rajadhanda.substack.com/api/v1/reader/feed/profile/43989908",
    "https://substack.com/api/v1/reader/feed/profile/43989908",
)
USER_AGENT = (
    "Mozilla/5.0 (compatible; RajaDhandaNotesSync/1.0; +https://rajadhanda.me/)"
)


class FeedError(Exception):
    """No valid public feed could be retrieved."""


def extract_notes(payload):
    if not isinstance(payload, dict) or not isinstance(payload.get("items"), list):
        raise FeedError("Unexpected feed response: expected an items array")
    notes = []
    seen = set()
    for item in payload["items"]:
        if not isinstance(item, dict) or item.get("type") != "comment":
            continue
        comment = item.get("comment")
        context = item.get("context", {})
        if not isinstance(comment, dict) or not isinstance(context, dict):
            continue
        # Exclude restacks, replies, and comments authored by other accounts.
        if context.get("type") != "note" or str(comment.get("user_id")) != str(PROFILE_ID):
            continue
        if comment.get("post_id") is not None or comment.get("ancestor_path"):
            continue
        body, note_id, timestamp = comment.get("body"), comment.get("id"), comment.get("date")
        if not isinstance(body, str) or not body.strip():
            continue
        if isinstance(note_id, bool) or not str(note_id).isdigit() or int(note_id) <= 0:
            continue
        if not isinstance(timestamp, str):
            continue
        try:
            published = datetime.fromisoformat(timestamp.replace("Z", "+00:00")).date().isoformat()
        except ValueError:
            continue
        link = f"{PROFILE_URL}/note/c-{note_id}"
        if link in seen:
            continue
        seen.add(link)
        notes.append({"text": body.strip(), "date": published, "link": link})
    if not notes:
        raise FeedError("Feed returned no valid original notes for this profile")
    return sorted(notes, key=lambda note: note["date"], reverse=True)


def fetch_notes(opener=urlopen, sleep=time.sleep):
    failures = []
    for url in FEED_URLS:
        for attempt in range(3):
            request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
            try:
                with opener(request, timeout=20) as response:
                    payload = json.load(response)
                return extract_notes(payload), url
            except HTTPError as error:
                failures.append(f"{url}: HTTP {error.code}")
                # Do not repeatedly retry a refused request. Try the other public host.
                retry = error.code == 429 or 500 <= error.code < 600
                error.close()
            except (URLError, TimeoutError, OSError) as error:
                failures.append(f"{url}: {error}")
                retry = True
            except (ValueError, FeedError) as error:
                failures.append(f"{url}: {error}")
                retry = False
            if not retry or attempt == 2:
                break
            sleep(2 ** attempt)
    raise FeedError("; ".join(failures))


def write_notes(path, notes):
    """Publish only a complete, validated payload; leave the old cache on failure."""
    path.parent.mkdir(parents=True, exist_ok=True)
    output = json.dumps(notes, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == output:
        return False
    temporary = None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as file:
            temporary = Path(file.name)
            file.write(output)
        temporary.replace(path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return True


def summary(message):
    print(message)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as file:
            file.write(message + "\n")


def sync(path, fetch=fetch_notes):
    try:
        notes, source = fetch()
        changed = write_notes(path, notes)
    except (FeedError, OSError) as error:
        summary(f"Notes sync failed; the existing cache was left unchanged. {error}")
        return 1
    summary(f"{'Updated' if changed else 'Verified'} {len(notes)} public notes from {source}.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("blog/notes.json"))
    args = parser.parse_args()
    return sync(args.output)


if __name__ == "__main__":
    sys.exit(main())
