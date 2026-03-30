from pathlib import Path
from typing import Iterable

# =========================
# CONFIG
# =========================

BACKEND_DIR = Path("backend")
FRONTEND_DIR = Path("frontend")

OUTPUT_STRUCTURE = Path("project_structure.txt")
OUTPUT_BACKEND = Path("backend_logic_export.txt")
OUTPUT_FRONTEND = Path("frontend_logic_export.txt")
OUTPUT_PASTE_READY = Path("paste_ready.txt")

EXCLUDED_DIRS = {
    "node_modules",
    "dist",
    "build",
    ".git",
    "coverage",
    ".next",
    ".turbo",
    "__pycache__",
    ".idea",
    ".vscode",
}

EXCLUDED_FILES = {
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "vite.config.ts",
    "vite.config.js",
    "eslint.config.js",
    "eslint.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "README.md",
}

BACKEND_EXTENSIONS = {".js", ".ts"}
FRONTEND_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}

# Prioridad lógica backend
BACKEND_PRIORITY_FOLDERS = [
    "services",
    "repositories",
    "controllers",
    "routes",
    "middlewares",
    "config",
]

# Prioridad lógica frontend
FRONTEND_PRIORITY_FOLDERS = [
    "pages",
    "components",
    "services",
    "context",
    "types",
]

# =========================
# HELPERS
# =========================

def should_exclude(path: Path) -> bool:
    if path.name in EXCLUDED_FILES:
        return True
    return any(part in EXCLUDED_DIRS for part in path.parts)


def folder_priority(path: Path, priorities: list[str]) -> int:
    path_str = path.as_posix().lower()
    for index, folder in enumerate(priorities):
        if f"/{folder}/" in f"/{path_str}/":
            return index
    return len(priorities) + 1


def collect_files(base_dir: Path, allowed_extensions: set[str], priorities: list[str]) -> list[Path]:
    if not base_dir.exists():
        return []

    files = []
    for path in base_dir.rglob("*"):
        if not path.is_file():
            continue
        if should_exclude(path):
            continue
        if path.suffix.lower() not in allowed_extensions:
            continue
        # solo src o subcarpetas relevantes
        if "src" not in path.parts:
            continue
        files.append(path)

    files.sort(key=lambda p: (folder_priority(p, priorities), p.as_posix().lower()))
    return files


def build_tree(base_dir: Path, prefix: str = "") -> list[str]:
    if not base_dir.exists():
        return []

    entries = [
        p for p in sorted(base_dir.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        if not should_exclude(p)
    ]

    lines = []
    for index, entry in enumerate(entries):
        connector = "└── " if index == len(entries) - 1 else "├── "
        lines.append(f"{prefix}{connector}{entry.name}")

        if entry.is_dir():
            extension = "    " if index == len(entries) - 1 else "│   "
            lines.extend(build_tree(entry, prefix + extension))

    return lines


def read_file_content(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def export_files(files: Iterable[Path], output_file: Path) -> None:
    with output_file.open("w", encoding="utf-8") as out:
        for file_path in files:
            out.write(f"===== {file_path.as_posix()} =====\n")
            out.write(read_file_content(file_path))
            out.write("\n\n")


def write_structure() -> None:
    with OUTPUT_STRUCTURE.open("w", encoding="utf-8") as out:
        out.write("ESTRUCTURA REAL DEL PROYECTO\n")
        out.write("===========================\n\n")

        if BACKEND_DIR.exists():
            out.write("backend/\n")
            out.write("\n".join(build_tree(BACKEND_DIR)))
            out.write("\n\n")

        if FRONTEND_DIR.exists():
            out.write("frontend/\n")
            out.write("\n".join(build_tree(FRONTEND_DIR)))
            out.write("\n")


def write_paste_ready(backend_files: list[Path], frontend_files: list[Path]) -> None:
    structure_content = OUTPUT_STRUCTURE.read_text(encoding="utf-8") if OUTPUT_STRUCTURE.exists() else ""
    backend_content = OUTPUT_BACKEND.read_text(encoding="utf-8") if OUTPUT_BACKEND.exists() else ""
    frontend_content = OUTPUT_FRONTEND.read_text(encoding="utf-8") if OUTPUT_FRONTEND.exists() else ""

    with OUTPUT_PASTE_READY.open("w", encoding="utf-8") as out:
        out.write("CONTEXTO PARA OTRA IA\n")
        out.write("====================\n\n")

        out.write("Instrucciones importantes:\n")
        out.write("- Te voy a pasar la estructura y archivos reales del proyecto.\n")
        out.write("- No inventes carpetas ni archivos nuevos.\n")
        out.write("- Trabajá solo sobre esta estructura.\n")
        out.write("- Si falta información, preguntame antes de asumir.\n\n")

        out.write("Resumen:\n")
        out.write(f"- Archivos backend útiles exportados: {len(backend_files)}\n")
        out.write(f"- Archivos frontend útiles exportados: {len(frontend_files)}\n\n")

        out.write("1) ESTRUCTURA REAL\n")
        out.write("------------------\n")
        out.write(structure_content)
        out.write("\n\n")

        out.write("2) BACKEND - CODIGO REAL UTIL\n")
        out.write("-----------------------------\n")
        out.write(backend_content)
        out.write("\n\n")

        out.write("3) FRONTEND - CODIGO REAL UTIL\n")
        out.write("------------------------------\n")
        out.write(frontend_content)
        out.write("\n")


def main() -> None:
    backend_files = collect_files(BACKEND_DIR, BACKEND_EXTENSIONS, BACKEND_PRIORITY_FOLDERS)
    frontend_files = collect_files(FRONTEND_DIR, FRONTEND_EXTENSIONS, FRONTEND_PRIORITY_FOLDERS)

    write_structure()
    export_files(backend_files, OUTPUT_BACKEND)
    export_files(frontend_files, OUTPUT_FRONTEND)
    write_paste_ready(backend_files, frontend_files)

    print("Export terminado.")
    print(f"- {OUTPUT_STRUCTURE}")
    print(f"- {OUTPUT_BACKEND}")
    print(f"- {OUTPUT_FRONTEND}")
    print(f"- {OUTPUT_PASTE_READY}")


if __name__ == "__main__":
    main()