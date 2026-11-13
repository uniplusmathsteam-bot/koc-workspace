#!/usr/bin/env python3
"""Accept PNG frames posted by the classroom page and write them to disk."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import base64
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "_frames"
OUT.mkdir(parents=True, exist_ok=True)


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        data = json.loads(raw)
        name = "".join(ch for ch in data["name"] if ch.isalnum() or ch in "-_")
        folder = OUT / name
        folder.mkdir(parents=True, exist_ok=True)
        png = data["png"].split(",", 1)[1]
        path = folder / f"{int(data['i']):03d}.png"
        path.write_bytes(base64.b64decode(png))
        body = json.dumps({"ok": True, "path": str(path)}).encode()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(fmt % args)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8771), Handler).serve_forever()
