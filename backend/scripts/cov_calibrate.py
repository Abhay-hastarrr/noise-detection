"""Utility script to inspect coefficient of variation (CoV) for noise calibration."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np


def compute_cov(image_path: Path) -> float:
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Unable to read image: {image_path}")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    noise_map = gray - blurred

    block_size = 32
    height, width = noise_map.shape
    stds: list[float] = []

    for y in range(0, height - block_size + 1, block_size):
        for x in range(0, width - block_size + 1, block_size):
            block = noise_map[y : y + block_size, x : x + block_size]
            stds.append(float(np.std(block)))

    if len(stds) < 4:
        return 0.0

    values = np.array(stds)
    mean_std = float(values.mean())
    if mean_std < 1e-6:
        return 0.0

    return float(values.std() / mean_std)


def main() -> None:
    parser = argparse.ArgumentParser(description="Calibrate noise CoV thresholds")
    parser.add_argument("images", nargs="+", help="Paths to images to inspect")
    args = parser.parse_args()

    for image in args.images:
        path = Path(image)
        try:
            cov = compute_cov(path)
            print(f"{path}: CoV={cov:.4f}")
        except Exception as exc:  # pragma: no cover - manual tool
            print(f"{path}: ERROR -> {exc}")

if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()
