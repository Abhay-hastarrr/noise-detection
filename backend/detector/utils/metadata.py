"""Full metadata heuristics for uploaded images."""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from PIL import ExifTags, Image


def _to_serializable(value: Any) -> Any:
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if isinstance(value, (bytes, bytearray)):
        try:
            return value.decode('utf-8')
        except UnicodeDecodeError:
            return value.decode('utf-8', errors='replace')
    return str(value)


# Software that definitively indicates editing (not just viewing/saving)
EDITING_SOFTWARE = [
    "photoshop", "gimp", "lightroom", "affinity", "pixelmator",
    "paint.net", "corel", "darktable", "capture one",
]

# Software that is neutral — just viewing or OS-level saving, not suspicious
NEUTRAL_SOFTWARE = [
    "windows", "apple", "google", "android", "samsung",
    "iphone", "preview", "photos", "gallery",
]


def analyze_metadata(image_path: str | Path) -> Dict[str, Any]:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image path not found: {path}")

    try:
        with Image.open(path) as img:
            exif_raw = img.getexif()
            pil_info_raw = dict(img.info) if img.info else {}
            image_info = {
                "format": img.format or "Unknown",
                "mode": img.mode,
                "width": img.width,
                "height": img.height,
            }
    except Exception as exc:
        raise ValueError(f"Unable to open image for metadata extraction: {exc}") from exc

    exif_data: Dict[str, Any] = {}
    if exif_raw:
        for tag_id, value in exif_raw.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            exif_data[str(tag)] = _to_serializable(value)

    pil_info = {str(key): _to_serializable(val) for key, val in pil_info_raw.items()}

    stats = os.stat(path)
    file_data = {
        "size_kb": round(stats.st_size / 1024, 2),
        "created": datetime.fromtimestamp(stats.st_ctime).strftime("%Y-%m-%d %H:%M"),
        "modified": datetime.fromtimestamp(stats.st_mtime).strftime("%Y-%m-%d %H:%M"),
    }

    tampered = False
    confidence = 0.0
    details: List[str] = []
    analysis: List[str] = []

    # --- Check 1: Editing software in EXIF (high signal) ---
    software_value = exif_data.get("Software")
    if software_value:
        software = str(software_value).lower()
        is_editing = any(kw in software for kw in EDITING_SOFTWARE)
        is_neutral = any(kw in software for kw in NEUTRAL_SOFTWARE)

        if is_editing and not is_neutral:
            tampered = True
            confidence += 0.5
            msg = f"Photo editing software detected in EXIF: {software_value}"
            details.append(msg)
            analysis.append(msg)
        else:
            analysis.append(f"Software tag present (non-suspicious): {software_value}")

    # --- Check 2: Software tag in PIL info (secondary signal) ---
    pil_info_str = str(pil_info).lower()
    if "software" in pil_info_str:
        pil_software = pil_info.get("Software") or pil_info.get("software") or ""
        sw = str(pil_software).lower()
        is_editing = any(kw in sw for kw in EDITING_SOFTWARE)
        is_neutral = any(kw in sw for kw in NEUTRAL_SOFTWARE)

        if is_editing and not is_neutral:
            tampered = True
            confidence += 0.2
            msg = f"Editing software in PIL info: {pil_software}"
            details.append(msg)
            analysis.append(msg)

    # --- Check 3: EXIF exists but no camera model AND no GPS (likely screenshot/export) ---
    has_exif = bool(exif_data)
    has_model = bool(exif_data.get("Model"))
    has_gps = "GPSInfo" in exif_data

    if has_exif and not has_model and not has_gps:
        # Has EXIF but stripped of camera-specific fields — common in edited exports
        confidence += 0.15
        msg = "EXIF present but no camera model or GPS — possibly a processed export"
        details.append(msg)
        analysis.append(msg)
    elif has_model:
        analysis.append(f"Captured using camera model: {exif_data['Model']}")

    # --- Check 4: Completely missing EXIF (weak signal alone) ---
    if not has_exif:
        confidence += 0.05
        msg = "No EXIF metadata detected"
        analysis.append(msg)

    # --- Check 5: Zero file size (definitive corruption) ---
    if file_data["size_kb"] == 0:
        tampered = True
        confidence += 0.5
        msg = "File size is 0 KB (invalid image data)"
        details.append(msg)
        analysis.append(msg)

    # --- Informational ---
    if image_info["format"].upper() != "JPEG":
        analysis.append(f"Non-JPEG format: {image_info['format']}")

    analysis.append(f"Resolution: {image_info['width']} x {image_info['height']} ({image_info['mode']})")

    confidence = float(min(confidence, 1.0))
    details_text = ", ".join(details) if details else "No metadata anomalies detected"

    return {
        "tampered": tampered,
        "confidence": confidence,
        "details": details_text,
        "analysis": analysis,
        "exif": exif_data,
        "image_info": image_info,
        "file_info": file_data,
        "pil_info": pil_info,
    }