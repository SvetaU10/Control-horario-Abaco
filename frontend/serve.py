"""Servidor local del frontend (MIME types correctos en Windows)."""
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8090
FRONTEND_DIR = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".webmanifest": "application/manifest+json",
    }


def create_handler():
    return partial(Handler, directory=str(FRONTEND_DIR))


if __name__ == "__main__":
    try:
        httpd = HTTPServer(("", PORT), create_handler())
    except OSError:
        print(
            f"El puerto {PORT} ya está en uso. "
            "Cierra otras terminales con servidores en 8090 y vuelve a ejecutar F5."
        )
        raise SystemExit(1)

    print(f"Abaco Developments frontend: http://localhost:{PORT}/login.html")
    print(f"Sirviendo archivos desde: {FRONTEND_DIR}")
    httpd.serve_forever()
