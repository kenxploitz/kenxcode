"""Resolve KENXCODE_HOME for standalone skill scripts.

Skill scripts may run outside the KenXCode process (system Python, nix env,
CI) where ``kenxcode_constants`` is not importable.  This module provides the
same ``get_kenxcode_home()`` contract without requiring it on ``sys.path``.

When ``kenxcode_constants`` IS available it is used directly so profile
resolution and any future enhancements are picked up automatically.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from kenxcode_constants import get_kenxcode_home as get_kenxcode_home
except (ModuleNotFoundError, ImportError):

    def get_kenxcode_home() -> Path:
        """Return the KenXCode home directory (default: ``~/.kenxcode``)."""
        val = os.environ.get("KENXCODE_HOME", "").strip()
        return Path(val) if val else Path.home() / ".kenxcode"
