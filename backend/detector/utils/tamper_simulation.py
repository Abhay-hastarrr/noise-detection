"""Utilities for simulating tampered images for testing."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict

import cv2
import numpy as np

MEDIA_TAMPERED_SUBDIR = Path('media') / 'tampered'


def simulate_tampering(image_path: str | Path) -> Dict[str, str]:
    """Create a simple clone attack by copying a random region elsewhere."""
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image path not found: {path}")

    image = cv2.imread(str(path))
    if image is None:
        raise ValueError("Unable to read image: unsupported format or corrupted file")

    height, width = image.shape[:2]
    if height < 20 or width < 20:
        raise ValueError("Image too small for tampering simulation")

    rng = np.random.default_rng()

    w = max(20, width // 4)
    h = max(20, height // 4)
    x = rng.integers(0, width - w)
    y = rng.integers(0, height - h)

    region = image[y : y + h, x : x + w].copy()

    min_displacement = max(min(width, height) // 3, 30)
    for _ in range(10):
        target_x = rng.integers(0, width - w)
        target_y = rng.integers(0, height - h)
        if np.hypot(target_x - x, target_y - y) >= min_displacement:
            break
    else:
        target_x = (x + width // 2) % max(1, width - w)
        target_y = (y + height // 2) % max(1, height - h)

    blurred = cv2.GaussianBlur(region, (5, 5), 0)
    alpha = 1.0 + rng.uniform(-0.1, 0.15)
    beta = rng.integers(-15, 16)
    adjusted = cv2.convertScaleAbs(blurred, alpha=alpha, beta=beta)

    image[target_y : target_y + h, target_x : target_x + w] = adjusted

    os.makedirs(MEDIA_TAMPERED_SUBDIR, exist_ok=True)

    new_name = f"tampered_{path.stem}.jpg"
    output_path = MEDIA_TAMPERED_SUBDIR / new_name
    success = cv2.imwrite(str(output_path), image)
    if not success:
        raise IOError("Failed to write tampered image")

    return {
        "tampered_path": str(output_path),
        "modification_type": "clone",
    }
