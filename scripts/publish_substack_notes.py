#!/usr/bin/env python3
"""Publish the current Substack Notes cache using the signed-in GitHub CLI."""

import base64
import json
import subprocess
import sys

from sync_substack_notes import FeedError, fetch_notes

NOTES_ENDPOINT = "repos/rajadhanda/rajadhanda.github.io/contents/blog/notes.json"


def github_api(*arguments, payload=None):
    response = subprocess.run(
        ["gh", "api", *arguments],
        input=json.dumps(payload) if payload is not None else None,
        stdout=subprocess.PIPE,
        text=True,
        check=True,
        timeout=35,
    )
    return json.loads(response.stdout)


def main():
    notes, source = fetch_notes()
    print(f"Fetched {len(notes)} public notes from {source}. Latest: {notes[0]['date']}.")
    current = github_api(f"{NOTES_ENDPOINT}?ref=main")
    previous = json.loads(base64.b64decode(current["content"]))
    if previous == notes:
        print("The published cache is already current.")
        return

    content = (json.dumps(notes, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    published = github_api(
        "--method", "PUT", NOTES_ENDPOINT, "--input", "-",
        payload={
            "branch": "main",
            "message": "Refresh public Substack notes",
            "sha": current["sha"],
            "content": base64.b64encode(content).decode("ascii"),
        },
    )
    print(f"Published {len(notes)} notes: {published['commit']['html_url']}")


if __name__ == "__main__":
    try:
        main()
    except (FeedError, subprocess.SubprocessError, ValueError, KeyError) as error:
        sys.exit(f"Substack publish failed: {error}")
