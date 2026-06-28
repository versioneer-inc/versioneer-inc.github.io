"""Local preview server for the static site."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the current directory for local preview.")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface to bind")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind")
    parser.add_argument(
        "--directory",
        default=".",
        help="Directory to serve (defaults to current project root)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    def handler(*handler_args, **handler_kwargs):
        return SimpleHTTPRequestHandler(
            *handler_args,
            directory=args.directory,
            **handler_kwargs,
        )

    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Preview running at http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping preview server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
