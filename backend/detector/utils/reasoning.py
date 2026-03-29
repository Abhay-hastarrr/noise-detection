"""Helpers for explaining tamper decisions."""

from __future__ import annotations

from typing import Optional

THRESHOLDS = {
    "clone_strong": 0.60,
    "noise_strong": 0.70,
    "metadata_support": 0.50,
    "clone_support": 0.35,
    "score_cutoff": 0.38,
}


def _clamp(value: Optional[float]) -> float:
    if value is None:
        return 0.0
    return max(0.0, min(1.0, float(value)))


def _pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def build_decision_reason(
    clone_confidence: Optional[float],
    noise_confidence: Optional[float],
    metadata_confidence: Optional[float],
    score: Optional[float],
    final_tampered: Optional[bool],
) -> str:
    """Return a human-readable explanation for the final prediction."""

    clone_conf = _clamp(clone_confidence)
    noise_conf = _clamp(noise_confidence)
    metadata_conf = _clamp(metadata_confidence)
    total_score = _clamp(score)

    if final_tampered is None:
        return "Prediction not available yet."

    if final_tampered:
        if clone_conf >= THRESHOLDS["clone_strong"]:
            return (
                "Clone detector confidence "
                f"{_pct(clone_conf)} exceeded the {int(THRESHOLDS['clone_strong'] * 100)}% "
                "override threshold, indicating duplicated regions."
            )
        if noise_conf >= THRESHOLDS["noise_strong"]:
            return (
                "Noise analysis confidence "
                f"{_pct(noise_conf)} surpassed the {int(THRESHOLDS['noise_strong'] * 100)}% limit, "
                "flagging texture anomalies typical of tampering."
            )
        if (
            metadata_conf >= THRESHOLDS["metadata_support"]
            and clone_conf >= THRESHOLDS["clone_support"]
        ):
            return (
                "Metadata irregularities (" + _pct(metadata_conf)
                + ") corroborated clone evidence (" + _pct(clone_conf)
                + "), triggering the combined rule."
            )
        if total_score > THRESHOLDS["score_cutoff"]:
            return (
                "Weighted score "
                f"{_pct(total_score)} exceeded the {int(THRESHOLDS['score_cutoff'] * 100)}% "
                "decision boundary (weights: clone 55%, noise 25%, metadata 20%)."
            )
        return "Tamper decision made, but no rule description available."

    return (
        "Detectors remained below their thresholds "
        f"(clone {_pct(clone_conf)}, noise {_pct(noise_conf)}, metadata {_pct(metadata_conf)}), "
        "and the weighted score "
        f"{_pct(total_score)} did not clear the 38% cutoff."
    )
