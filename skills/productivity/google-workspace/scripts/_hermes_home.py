"""Resolve KENXCODE_HOME for standalone skill scripts.

Skill scripts may run outside the KenXCode process (e.g. system Python,
nix env, CI) where ``kenxcode_constants`` is not importable.  This module
provides the same ``get_kenxcode_home()`` and ``display_kenxcode_home()``
contracts as ``kenxcode_constants`` without requiring it on ``sys.path``.

When ``kenxcode_constants`` IS available it is used directly so that any
future enhancements (profile resolution, Docker detection, etc.) are
picked up automatically.  The fallback path replicates the core logic
from ``kenxcode_constants.py`` using only the stdlib.

All scripts under ``google-workspace/scripts/`` should import from here
instead of duplicating the ``KENXCODE_HOME = Path(os.getenv(...))`` pattern.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from kenxcode_constants import display_kenxcode_home as display_kenxcode_home
    from kenxcode_constants import get_kenxcode_home as get_kenxcode_home
except (ModuleNotFoundError, ImportError):

    def get_kenxcode_home() -> Path:
        """Return the KenXCode home directory (default: ~/.kenxcode).

        Mirrors ``kenxcode_constants.get_kenxcode_home()``."""
        val = os.environ.get("KENXCODE_HOME", "").strip()
        return Path(val) if val else Path.home() / ".kenxcode"

    def display_kenxcode_home() -> str:
        """Return a user-friendly ``~/``-shortened display string.

        Mirrors ``kenxcode_constants.display_kenxcode_home()``."""
        home = get_kenxcode_home()
        try:
            return "~/" + str(home.relative_to(Path.home()))
        except ValueError:
            return str(home)
