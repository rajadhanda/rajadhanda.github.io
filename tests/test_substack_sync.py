import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from urllib.error import HTTPError

SPEC = importlib.util.spec_from_file_location("sync_substack_notes", Path(__file__).parents[1] / "scripts/sync_substack_notes.py")
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)


def note(identifier=42, body="A real note", date="2026-11-20T12:00:00Z", user=sync.PROFILE_ID):
    return {"type": "comment", "context": {"type": "note"}, "comment": {"id": identifier, "body": body, "date": date, "user_id": user, "post_id": None, "ancestor_path": None}}


class NotesSyncTests(unittest.TestCase):
    def test_filters_replies_restacks_other_authors_and_invalid_notes(self):
        reply = note(3); reply["comment"]["ancestor_path"] = "42"
        restack = note(4); restack["type"] = "restack"
        invalid = note(5, date="not a date")
        older = note(8, body="Line one\n\nLine two", date="2026-11-01T09:00:00Z")
        result = sync.extract_notes({"items": [older, reply, restack, note(7, user=123), invalid, note(), note()]})
        self.assertEqual([n["link"] for n in result], [f"{sync.PROFILE_URL}/note/c-42", f"{sync.PROFILE_URL}/note/c-8"])
        self.assertEqual(result[1]["text"], "Line one\n\nLine two")
        self.assertEqual(result[0]["date"], "2026-11-20")

    def test_refused_host_uses_other_public_host_without_credentials(self):
        calls = []
        def opener(request, timeout):
            calls.append(request)
            if len(calls) == 1:
                raise HTTPError(request.full_url, 403, "Forbidden", {}, None)
            return io.BytesIO(json.dumps({"items": [note()]}).encode())
        notes, source = sync.fetch_notes(opener, sleep=lambda _: self.fail("403 must not be repeatedly retried"))
        self.assertEqual(source, sync.FEED_URLS[1])
        self.assertEqual(len(notes), 1)
        self.assertIn("Mozilla/5.0", calls[0].get_header("User-agent"))
        self.assertIsNone(calls[0].get_header("Cookie"))
        self.assertIsNone(calls[0].get_header("Authorization"))

    def test_transient_failure_is_retried(self):
        calls, waits = [], []
        def opener(request, timeout):
            calls.append(request.full_url)
            if len(calls) == 1:
                raise HTTPError(request.full_url, 503, "Unavailable", {}, None)
            return io.BytesIO(json.dumps({"items": [note()]}).encode())
        result, _ = sync.fetch_notes(opener, sleep=waits.append)
        self.assertEqual(len(result), 1)
        self.assertEqual(calls, [sync.FEED_URLS[0]] * 2)
        self.assertEqual(waits, [1])

    def test_failed_fetch_preserves_last_good_cache_and_reports_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "notes.json"
            original = '[{"text":"Keep this cached note"}]\n'
            path.write_text(original)
            def unavailable(): raise sync.FeedError("HTTP 403")
            self.assertEqual(sync.sync(path, fetch=unavailable), 1)
            self.assertEqual(path.read_text(), original)

    def test_invalid_or_empty_payload_never_erases_cache(self):
        for payload in ({}, {"items": []}, {"items": [note(body=" ")]}):
            with self.subTest(payload=payload):
                with self.assertRaises(sync.FeedError): sync.extract_notes(payload)

    def test_complete_cache_update_and_unchanged_run(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "blog" / "notes.json"
            notes = sync.extract_notes({"items": [note()]})
            self.assertTrue(sync.write_notes(path, notes))
            self.assertEqual(json.loads(path.read_text()), notes)
            self.assertFalse(sync.write_notes(path, notes))
            self.assertEqual(list(path.parent.iterdir()), [path])


if __name__ == "__main__":
    unittest.main()
