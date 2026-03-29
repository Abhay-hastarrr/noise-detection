"""Utility functions for noise-based tamper heuristics."""

from __future__ import annotations

from pathlib import Path
from typing import Dict

import cv2
import numpy as np


def detect_noise(image_path: str | Path) -> Dict[str, float | bool]:
    """
    Detect potential tampering by analysing inconsistent noise patterns across
    image regions. Tampered images often contain spliced regions with a
    different noise profile from the rest of the image.

    Strategy:
      1. Compute the per-block noise level (using a high-pass filter) for
         non-overlapping 32×32 blocks across the image.
      2. Measure the coefficient of variation (std / mean) of those block-level
         noise values.  A high CoV means some regions are much noisier/smoother
         than others — a hallmark of copy-move or splicing.
      3. Map the CoV to a [0, 1] confidence score.
    """
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image path not found: {path}")

    image = cv2.imread(str(path))
    if image is None:
        raise ValueError("Unable to read image: unsupported format or corrupted file")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32)

    # High-pass filter isolates the noise component
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    noise_map = gray - blurred  # residual = noise

    block_size = 32
    height, width = noise_map.shape
    block_stds: list[float] = []

    for y in range(0, height - block_size + 1, block_size):
        for x in range(0, width - block_size + 1, block_size):
            block = noise_map[y : y + block_size, x : x + block_size]
            block_stds.append(float(np.std(block)))

    if len(block_stds) < 4:
        # Too few blocks — image is tiny, skip
        print("DEBUG NOISE RAW: insufficient blocks")
        print("DEBUG NOISE CONF: 0.0")
        return {"tampered": False, "confidence": 0.0}

    stds = np.array(block_stds)
    mean_std = float(stds.mean())
    std_of_stds = float(stds.std())

    # Coefficient of variation — high value = inconsistent noise = suspicious
    if mean_std < 1e-6:
        cov = 0.0
    else:
        cov = std_of_stds / mean_std

    # Map CoV to confidence using a piecewise curve tuned to observed ranges
    if cov < 0.25:
        confidence = 0.0
    elif cov < 0.45:
        confidence = (cov - 0.25) / 0.2 * 0.35        # 0.0 → 0.35
    elif cov < 0.65:
        confidence = 0.35 + (cov - 0.45) / 0.2 * 0.35 # 0.35 → 0.70
    else:
        confidence = min(0.70 + (cov - 0.65) * 1.0, 1.0)  # 0.70+

    confidence = float(max(min(confidence, 1.0), 0.0))
    tampered = confidence > 0.5

    print("DEBUG NOISE RAW (CoV):", round(cov, 4))
    print("DEBUG NOISE CONF:", round(confidence, 4))

    return {
        "tampered": tampered,
        "confidence": confidence,
    }