# Noise Ninja — Image Tampering Detection Suite

Noise Ninja is a full-stack forensic analysis workbench that combines a Django REST API with a React dashboard to detect copy-move forgeries, suspicious noise signatures, and metadata anomalies. The backend orchestrates multiple detectors (clone, noise, metadata, Error Level Analysis) and returns a reasoned decision with forensic overlays, while the frontend surfaces the results with rich visuals suitable for investigations or demos.

## Highlights

- **Multi-detector pipeline** – clone hotspots via OpenCV, noise CoV statistics, structured metadata heuristics, and Error Level Analysis heatmaps rendered with Pillow.
- **Tamper simulation mode** – optionally auto-generates a tampered image for testing and labels the ground-truth outcome.
- **Transparent decisions** – weighted scoring (clone 55%, noise 25%, metadata 20%) plus rule-based overrides produce a natural-language explanation for every verdict.
- **Forensic visuals** – original upload, ELA rendering, and clone heatmap are persisted under `media/analysis` and displayed in the UI.
- **History + accuracy dashboard** – review prior analyses, compare prediction vs actual result, and monitor aggregate accuracy.
- **Calibration tooling** – utility script to inspect coefficient-of-variation distributions so you can retune noise thresholds for new datasets.

## Repository Layout

```
backend/                # Django project
  backend/              # Django settings & root URLConf
  detector/             # REST API app, detectors, serializers
  media/                # Uploaded originals/tampered files + generated overlays
  scripts/              # Support utilities (e.g., CoV calibration)
frontend/               # React + Vite single-page app
```

Key backend modules:

| File | Purpose |
| --- | --- |
| `detector/views.py` | API endpoints: upload analysis, history, accuracy, detail lookup |
| `detector/utils/clone_detection.py` | Copy-move detector, hotspot tracking, heatmap generation |
| `detector/utils/noise_detection.py` | Block-based noise variance → confidence mapping |
| `detector/utils/metadata.py` | EXIF/file heuristics and anomaly scoring |
| `detector/utils/ela.py` | Error Level Analysis rendering |
| `detector/utils/reasoning.py` | Generates human-readable explanations for each verdict |
| `scripts/cov_calibrate.py` | CLI helper to measure noise CoV across sample sets |

Frontend highlights:

| File | Purpose |
| --- | --- |
| `src/components/home/UploadForm.jsx` | Handles uploads + tamper simulation toggle |
| `src/components/home/AnalysisResult.jsx` | Shows decision, confidences, metadata, and forensic visuals |
| `src/pages/History.jsx` + `src/pages/ImageDetail.jsx` | Browsing prior analyses with detail view |
| `src/hooks/useUploadAnalysis.js` | Encapsulates upload workflow and API calls |

## Cloning the Project

```bash
git clone https://github.com/your-org-or-user/noise-ninja.git
cd noise-ninja
```

If you use SSH keys, swap the URL accordingly (e.g., `git@github.com:your-org-or-user/noise-ninja.git`). After cloning, follow the backend and frontend setup steps below in separate terminals for the smoothest experience.

## Backend Setup

1. **Create and activate a virtual environment** (examples use PowerShell on Windows):
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```
3. **Apply migrations & create the media folders**:
   ```powershell
   python manage.py migrate
   python manage.py createsuperuser  # optional, for Django admin
   ```
   Media folders (`media/original`, `media/tampered`, `media/analysis/ela`, `media/analysis/heatmaps`) will be created automatically on first use, but you can pre-create them if desired.
4. **Run the API**:
   ```powershell
   python manage.py runserver 0.0.0.0:8000
   ```

### Environment Notes

- Default settings assume DEBUG on and `MEDIA_URL=/media/`. If you deploy elsewhere, ensure the frontend’s `API baseURL` and static/media hosting match.
- CORS is enabled via `django-cors-headers`; configure allowed origins in `settings.py` if hosting the frontend separately.

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Configure the API base URL if needed: `src/api/api.js` defaults to `http://127.0.0.1:8000/api/`.
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Visit the Vite URL (typically `http://localhost:5173`) and point it at the running backend.

## API Overview

All endpoints live under `/api/`.

| Method & Path | Description |
| --- | --- |
| `POST /api/upload/` | Upload an image (`image` field) and optionally append `?simulate=true` to generate a tampered pair. Returns detector confidences, metadata, forensic URLs, and `decision_reason`. |
| `GET /api/history/` | List prior analyses (ordered by newest first). |
| `GET /api/history/<id>/` or `/api/analysis/<id>/` | Retrieve a single analysis with all metadata & asset URLs. |
| `GET /api/accuracy/` | Returns total labeled samples, correct predictions, and accuracy percentage. |

Sample upload response (truncated):

```json
{
  "id": 42,
  "predicted_result": true,
  "confidence": 0.67,
  "clone_confidence": 0.78,
  "noise_confidence": 0.12,
  "metadata_confidence": 0.31,
  "decision_reason": "Clone detector confidence 78.0% exceeded the 60% override threshold...",
  "metadata": { "exif": { ... } },
  "ela_image": "http://127.0.0.1:8000/media/analysis/ela/sample_ela.jpg",
  "heatmap_image": "http://127.0.0.1:8000/media/analysis/heatmaps/sample_heatmap.jpg"
}
```

## Detector Logic & Reasoning

1. **Clone Detection** – block matching finds duplicated regions; hotspots feed the heatmap generator.
2. **Noise Analysis** – block-wise standard deviation is converted to a coefficient-of-variation (CoV) and mapped onto a 0–1 confidence curve.
3. **Metadata Analysis** – Heuristics over EXIF presence, mismatched dimensions, compression signatures, etc.
4. **Decision Layer** – Weighted score (clone 55%, noise 25%, metadata 20%) plus shortcut rules:
   - Clone ≥ 0.60 → tampered.
   - Noise ≥ 0.70 → tampered.
   - Metadata ≥ 0.50 *and* clone ≥ 0.35 → tampered.
   - Otherwise tampered if weighted score > 0.38.

`utils/reasoning.py` turns the above into readable prose, e.g. “Clone detector confidence 74.1% exceeded the 60% override threshold” or, for clean calls, “Detectors remained below their thresholds ... and the weighted score 22.5% did not clear the 38% cutoff.” The frontend surfaces this under “Decision Rationale”.

## Forensic Overlays

- **ELA**: Generated JPEG highlighting compression residuals. Saved to `media/analysis/ela/<basename>_ela.jpg`.
- **Clone Heatmap**: Colorized overlay marking detected hotspots. Saved to `media/analysis/heatmaps/<basename>_heatmap.jpg`.
- URLs are exposed via the serializer so the React dashboard can render them under “Forensic Visuals.”

## Noise CoV Calibration Script

Use `backend/scripts/cov_calibrate.py` to understand how your dataset’s clean vs tampered samples distribute their coefficient of variation.

```bash
cd backend
python scripts/cov_calibrate.py path/to/clean/*.jpg path/to/tampered/*.jpg
```

The script prints `CoV=...` per file so you can fine-tune the breakpoints in `utils/noise_detection.py`. This is especially helpful when introducing a new dataset or camera profile.

## Working With Datasets

To compare detector output against a labeled dataset:

1. Organize images into folders (e.g., `datasets/clean`, `datasets/tampered`).
2. Write a simple harness (or reuse the upload API via cURL/Postman) that iterates over each file, POSTs it to `/api/upload/`, and records the predicted result vs your label.
3. Optionally call `/api/accuracy/` after inserting ground-truth (`actual_result`) via the admin site or a management command.
4. Use the saved `decision_reason`, confidences, and forensic URLs to audit borderline cases.

(For large-scale evaluation, create a Django management command or standalone script that loads the dataset manifest, calls the detectors directly, and writes metrics—this keeps traffic local and bypasses HTTP overhead.)

## Development Tips

- **Media Cleanup**: Because generated artifacts accumulate under `media/analysis`, periodically purge old runs during development.
- **Logs**: The upload view prints noise/clone/metadata inputs plus the final decision path—handy while tuning thresholds.
- **CORS/HTTPS**: When deploying, update `settings.py` with your allowed origins and serve media via a CDN or object storage.
- **Testing Ideas**: Add unit tests under `detector/tests.py` to cover reasoning logic, metadata heuristics, and API contracts.

Need help extending the pipeline (e.g., integrating SPN detectors, transformer-based forgery classifiers, or bulk dataset evaluation)? Open an issue or reach out with details—Noise Ninja is designed to be modular and easy to upgrade.
