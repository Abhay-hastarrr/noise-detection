"""Error Level Analysis (ELA) utilities for image tamper inspection."""

from __future__ import annotations

import tempfile
import uuid
from pathlib import Path
from typing import Union

from PIL import Image, ImageChops, ImageEnhance

PathLike = Union[str, Path]


def perform_ela(path: PathLike, output_path: PathLike, quality: int = 90) -> str:
    """Generate an Error Level Analysis image.

    Args:
        path: Path to the source image.
        output_path: Where to save the resulting ELA visualization.
        quality: JPEG re-encode quality (lower highlights differences more).

    Returns:
        The string path to the generated ELA image.
    """

    source = Path(path)
    destination = Path(output_path)
    if not source.exists():
        raise FileNotFoundError(f"Source image not found: {source}")

    temp_path = _temporary_jpeg_path(source.stem)
    original = Image.open(source).convert("RGB")
    try:
        original.save(str(temp_path), "JPEG", quality=quality)
        with Image.open(str(temp_path)) as compressed:
            difference = ImageChops.difference(original, compressed)
            extrema = difference.getextrema()
            max_diff = max((channel[1] for channel in extrema if channel), default=0)
            scale = 255.0 / max_diff if max_diff else 1.0
            ela_image = ImageEnhance.Brightness(difference).enhance(scale)
            destination.parent.mkdir(parents=True, exist_ok=True)
            ela_image.save(destination)
    finally:
        original.close()
        temp_path.unlink(missing_ok=True)

    return str(destination)


def _temporary_jpeg_path(stem: str) -> Path:
    safe_stem = stem or "image"
    unique = uuid.uuid4().hex
    return Path(tempfile.gettempdir()) / f"ela_tmp_{safe_stem}_{unique}.jpg"
