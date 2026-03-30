"""Evaluate detector performance on local datasets of clean and tampered images.

Usage example:
    python scripts/evaluate_dataset.py --clean-dir ../datasets/clean --tampered-dir ../datasets/tampered --csv results.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
CLONE_WEIGHT = 0.55
NOISE_WEIGHT = 0.25
METADATA_WEIGHT = 0.20
SCORE_THRESHOLD = 0.38
CLONE_STRONG = 0.60
NOISE_STRONG = 0.70
METADATA_SUPPORT = 0.50
CLONE_SUPPORT = 0.35


@dataclass
class SampleResult:
    path: Path
    label: bool  # True = tampered
    predicted: bool
    score: float
    clone_conf: float
    noise_conf: float
    metadata_conf: float
    decision_reason: str


def configure_django() -> None:
    """Ensure Django knows where settings live so we can reuse detector utilities."""

    backend_dir = Path(__file__).resolve().parents[1]
    if str(backend_dir) not in sys.path:
        sys.path.append(str(backend_dir))

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    try:
        import django  # type: ignore

        django.setup()
    except Exception as exc:  # pragma: no cover - configuration error
        raise SystemExit(f"Failed to configure Django environment: {exc}") from exc


def import_detectors():
    from detector.utils.clone_detection import detect_clone  # type: ignore
    from detector.utils.metadata import analyze_metadata  # type: ignore
    from detector.utils.noise_detection import detect_noise  # type: ignore
    from detector.utils.reasoning import build_decision_reason  # type: ignore

    return detect_clone, analyze_metadata, detect_noise, build_decision_reason


def persist_metrics(metrics: dict[str, float], label: str | None) -> None:
    """Store the aggregate metrics so the API/frontend can surface them."""

    try:
        from detector.models import DatasetEvaluation  # type: ignore

        DatasetEvaluation.objects.create(
            label=label or "",
            total_samples=int(metrics.get("total", 0)),
            true_positive=int(metrics.get("true_positive", 0)),
            true_negative=int(metrics.get("true_negative", 0)),
            false_positive=int(metrics.get("false_positive", 0)),
            false_negative=int(metrics.get("false_negative", 0)),
            accuracy=float(metrics.get("accuracy", 0.0)),
            precision=float(metrics.get("precision", 0.0)),
            recall=float(metrics.get("recall", 0.0)),
            f1=float(metrics.get("f1", 0.0)),
        )
        print("Dataset evaluation stored in the database.")
    except Exception as exc:  # pragma: no cover - optional persistence
        print(f"Warning: unable to persist metrics ({exc}).")


def clamp(value: float | int | None) -> float:
    if value is None:
        return 0.0
    try:
        num = float(value)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(1.0, num))


def gather_images(folder: Path) -> List[Path]:
    if not folder.exists():
        raise FileNotFoundError(f"Dataset folder not found: {folder}")
    if not folder.is_dir():
        raise NotADirectoryError(f"Dataset path is not a directory: {folder}")

    return sorted(
        path for path in folder.rglob("*") if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )


def evaluate_sample(
    image_path: Path,
    label: bool,
    detect_clone,
    analyze_metadata,
    detect_noise,
    build_decision_reason,
) -> SampleResult:
    detection_source = str(image_path)

    metadata_result = analyze_metadata(detection_source)
    noise_result = detect_noise(detection_source)
    clone_result = detect_clone(detection_source)

    clone_confidence = clamp(clone_result.get("confidence"))
    noise_confidence = clamp(noise_result.get("confidence"))
    metadata_confidence = clamp(metadata_result.get("confidence"))

    score = (
        (clone_confidence * CLONE_WEIGHT)
        + (noise_confidence * NOISE_WEIGHT)
        + (metadata_confidence * METADATA_WEIGHT)
    )

    final_tampered = False
    if clone_confidence >= CLONE_STRONG:
        final_tampered = True
    elif noise_confidence >= NOISE_STRONG:
        final_tampered = True
    elif metadata_confidence >= METADATA_SUPPORT and clone_confidence >= CLONE_SUPPORT:
        final_tampered = True
    elif score > SCORE_THRESHOLD:
        final_tampered = True

    reason = build_decision_reason(
        clone_confidence,
        noise_confidence,
        metadata_confidence,
        score,
        final_tampered,
    )

    return SampleResult(
        path=image_path,
        label=label,
        predicted=final_tampered,
        score=score,
        clone_conf=clone_confidence,
        noise_conf=noise_confidence,
        metadata_conf=metadata_confidence,
        decision_reason=reason,
    )


def compute_metrics(results: Sequence[SampleResult]) -> dict[str, float]:
    tp = sum(1 for r in results if r.label and r.predicted)
    tn = sum(1 for r in results if (not r.label) and (not r.predicted))
    fp = sum(1 for r in results if (not r.label) and r.predicted)
    fn = sum(1 for r in results if r.label and (not r.predicted))

    total = len(results)
    accuracy = (tp + tn) / total if total else 0.0
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) else 0.0

    return {
        "total": float(total),
        "true_positive": float(tp),
        "true_negative": float(tn),
        "false_positive": float(fp),
        "false_negative": float(fn),
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


def export_csv(results: Sequence[SampleResult], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(
            [
                "path",
                "label",
                "predicted",
                "score",
                "clone_confidence",
                "noise_confidence",
                "metadata_confidence",
                "decision_reason",
            ]
        )
        for r in results:
            writer.writerow(
                [
                    str(r.path),
                    "tampered" if r.label else "clean",
                    r.predicted,
                    f"{r.score:.4f}",
                    f"{r.clone_conf:.4f}",
                    f"{r.noise_conf:.4f}",
                    f"{r.metadata_conf:.4f}",
                    r.decision_reason,
                ]
            )


def export_json(results: Sequence[SampleResult], metrics: dict[str, float], destination: Path) -> None:
    payload = {
        "metrics": metrics,
        "samples": [
            {
                "path": str(r.path),
                "label": "tampered" if r.label else "clean",
                "predicted": r.predicted,
                "score": round(r.score, 4),
                "clone_confidence": round(r.clone_conf, 4),
                "noise_confidence": round(r.noise_conf, 4),
                "metadata_confidence": round(r.metadata_conf, 4),
                "decision_reason": r.decision_reason,
            }
            for r in results
        ],
    }

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate detector accuracy on labeled datasets")
    parser.add_argument("--clean-dir", required=True, type=Path, help="Directory containing known clean images")
    parser.add_argument(
        "--tampered-dir",
        required=True,
        type=Path,
        help="Directory containing known tampered images",
    )
    parser.add_argument("--csv", type=Path, help="Optional CSV export path for per-sample details")
    parser.add_argument("--json", type=Path, help="Optional JSON export path for metrics and samples")
    parser.add_argument(
        "--label",
        type=str,
        help="Optional label for this evaluation run (e.g., 'Benchmark v1')",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    configure_django()
    detect_clone, analyze_metadata, detect_noise, build_decision_reason = import_detectors()

    clean_images = gather_images(args.clean_dir)
    tampered_images = gather_images(args.tampered_dir)

    if not clean_images and not tampered_images:
        raise SystemExit("No images found in the provided dataset directories.")

    results: List[SampleResult] = []

    for path in clean_images:
        result = evaluate_sample(
            path,
            label=False,
            detect_clone=detect_clone,
            analyze_metadata=analyze_metadata,
            detect_noise=detect_noise,
            build_decision_reason=build_decision_reason,
        )
        results.append(result)

    for path in tampered_images:
        result = evaluate_sample(
            path,
            label=True,
            detect_clone=detect_clone,
            analyze_metadata=analyze_metadata,
            detect_noise=detect_noise,
            build_decision_reason=build_decision_reason,
        )
        results.append(result)

    metrics = compute_metrics(results)

    persist_metrics(metrics, args.label)

    print("\n=== DATASET EVALUATION SUMMARY ===")
    print(f"Total samples: {int(metrics['total'])}")
    print(f"Accuracy: {metrics['accuracy'] * 100:.2f}%")
    print(f"Precision: {metrics['precision'] * 100:.2f}%")
    print(f"Recall: {metrics['recall'] * 100:.2f}%")
    print(f"F1 Score: {metrics['f1'] * 100:.2f}%")
    print(
        "Breakdown: TP={tp}, TN={tn}, FP={fp}, FN={fn}".format(
            tp=int(metrics["true_positive"]),
            tn=int(metrics["true_negative"]),
            fp=int(metrics["false_positive"]),
            fn=int(metrics["false_negative"]),
        )
    )

    if args.csv:
        export_csv(results, args.csv)
        print(f"Per-sample details exported to {args.csv}")

    if args.json:
        export_json(results, metrics, args.json)
        print(f"Metrics and samples exported to {args.json}")


if __name__ == "__main__":
    main()
