"""Clone (copy-move) detection utilities using block comparisons."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import cv2
import numpy as np

BLOCK_SIZE = 16
SIMILARITY_THRESHOLD = 50.0        # was 400 — strict, near-identical blocks only
MIN_SPATIAL_DISTANCE = BLOCK_SIZE * 3  # was 2x — avoid adjacent block noise
MATCH_THRESHOLD = 10
MAX_BLOCK_DIMENSION = 512
HARD_MATCH_LIMIT = 250
HOTSPOT_LIMIT = 200


def _extract_blocks(gray: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    blocks = []
    positions = []
    height, width = gray.shape

    for y in range(0, height - BLOCK_SIZE + 1, BLOCK_SIZE):
        for x in range(0, width - BLOCK_SIZE + 1, BLOCK_SIZE):
            block = gray[y : y + BLOCK_SIZE, x : x + BLOCK_SIZE].astype(np.float32)

            # Skip uniform/blank blocks — they match everything and cause false positives
            if block.std() < 5.0:
                continue

            blocks.append(block.flatten())
            positions.append((x + BLOCK_SIZE / 2, y + BLOCK_SIZE / 2))

    if not blocks:
        return np.empty((0, BLOCK_SIZE * BLOCK_SIZE), dtype=np.float32), np.empty((0, 2), dtype=np.float32)

    return np.stack(blocks), np.array(positions, dtype=np.float32)


def detect_clone(image_path: str | Path) -> Dict[str, float | int | bool | List[Dict[str, float]]]:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image path not found: {path}")

    image = cv2.imread(str(path))
    if image is None:
        raise ValueError("Unable to read image: unsupported format or corrupted file")

    height, width = image.shape[:2]
    max_dim = max(height, width)
    if max_dim > MAX_BLOCK_DIMENSION:
        scale = MAX_BLOCK_DIMENSION / max_dim
        new_size = (int(width * scale), int(height * scale))
        image = cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blocks, positions = _extract_blocks(gray)

    matches = 0
    hotspots: List[Tuple[float, float]] = []
    block_count = len(blocks)

    if block_count < 2:
        return {"tampered": False, "confidence": 0.0, "matches": 0, "hotspots": []}

    for i in range(block_count):
        if matches >= HARD_MATCH_LIMIT:
            break

        for j in range(i + 1, block_count):
            spatial_distance = float(np.linalg.norm(positions[i] - positions[j]))
            if spatial_distance <= MIN_SPATIAL_DISTANCE:
                continue

            diff = blocks[i] - blocks[j]
            mse = float(np.mean(diff * diff))
            if mse < SIMILARITY_THRESHOLD:
                matches += 1
                if len(hotspots) < HOTSPOT_LIMIT:
                    hotspots.append(tuple(positions[i]))
                    if len(hotspots) < HOTSPOT_LIMIT:
                        hotspots.append(tuple(positions[j]))
                if matches >= HARD_MATCH_LIMIT:
                    break

    # Tiered confidence — avoids the flat 0.555 ceiling from the old formula
    if matches < 10:
        confidence = 0.0
    elif matches < 30:
        confidence = 0.2
    elif matches < 60:
        confidence = 0.4
    elif matches < 100:
        confidence = 0.6
    else:
        confidence = min(0.5 + (matches - 100) / 400, 1.0)

    confidence = float(max(min(confidence, 1.0), 0.0))
    tampered = confidence > 0.5

    print("CLONE DEBUG:")
    print("Matches:", matches)
    print("Confidence:", confidence)
    print("Tampered:", tampered)

    return {
        "tampered": tampered,
        "confidence": confidence,
        "matches": matches,
        "hotspots": [
            {"x": float(point[0]), "y": float(point[1])}
            for point in hotspots
        ],
    }


def generate_heatmap(
    image_path: str | Path,
    hotspots: Sequence[Dict[str, float]] | None = None,
    output_path: str | Path | None = None,
) -> str:
    """Overlay hotspot activity on top of the original image and persist the heatmap."""

    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image path not found: {path}")

    image = cv2.imread(str(path))
    if image is None:
        raise ValueError("Unable to read image: unsupported format or corrupted file")

    heatmap = np.zeros_like(image)

    if hotspots:
        for point in hotspots:
            x = int(point.get("x", 0))
            y = int(point.get("y", 0))
            cv2.circle(heatmap, (x, y), 16, (0, 0, 255), -1)

    overlay = cv2.addWeighted(image, 0.7, heatmap, 0.3, 0)

    destination = Path(output_path) if output_path else path.with_name(f"{path.stem}_heatmap.jpg")
    destination.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(destination), overlay)

    return str(destination)