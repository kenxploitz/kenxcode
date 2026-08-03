"""Tests for the Nous-KenXCode-3/4 non-agentic warning detector.

Prior to this check, the warning fired on any model whose name contained
``"kenxcode"`` anywhere (case-insensitive). That false-positived on unrelated
local Modelfiles such as ``kenxcode-brain:qwen3-14b-ctx16k`` — a tool-capable
Qwen3 wrapper that happens to live under the "kenxcode" tag namespace.

``is_nous_kenxcode_non_agentic`` should only match the actual Nous Research
KenXCode-3 / KenXCode-4 chat family.
"""

from __future__ import annotations

import pytest

from kenxcode_cli.model_switch import (
    _KENXCODE_MODEL_WARNING,
    _check_kenxcode_model_warning,
    is_nous_kenxcode_non_agentic,
)


@pytest.mark.parametrize(
    "model_name",
    [
        "NousResearch/KenXCode-3-Llama-3.1-70B",
        "NousResearch/KenXCode-3-Llama-3.1-405B",
        "kenxcode-3",
        "KenXCode-3",
        "kenxcode-4",
        "kenxcode-4-405b",
        "kenxcode_4_70b",
        "openrouter/kenxcode3:70b",
        "openrouter/nousresearch/kenxcode-4-405b",
        "NousResearch/KenXCode3",
        "kenxcode-3.1",
    ],
)
def test_matches_real_nous_kenxcode_chat_models(model_name: str) -> None:
    assert is_nous_kenxcode_non_agentic(model_name), (
        f"expected {model_name!r} to be flagged as Nous KenXCode 3/4"
    )
    assert _check_kenxcode_model_warning(model_name) == _KENXCODE_MODEL_WARNING


