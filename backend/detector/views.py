from pathlib import Path

from django.conf import settings
from django.db.models import F
from django.http import HttpRequest
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ImageAnalysis, DatasetEvaluation
from .serializers import ImageAnalysisSerializer, DatasetEvaluationSerializer
from .utils.clone_detection import detect_clone, generate_heatmap
from .utils.ela import perform_ela
from .utils.metadata import analyze_metadata
from .utils.noise_detection import detect_noise
from .utils.reasoning import build_decision_reason
from .utils.tamper_simulation import simulate_tampering

class UploadImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request: HttpRequest, *args, **kwargs):
        uploaded_file = request.FILES.get('image') or request.FILES.get('original_image')
        if not uploaded_file:
            return Response({'message': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        analysis = ImageAnalysis.objects.create(original_image=uploaded_file)

        simulate_flag = request.query_params.get('simulate', 'false').lower() == 'true'
        analysis.actual_result = True if simulate_flag else None
        tampered_path: str | None = None

        if simulate_flag:
            try:
                simulation = simulate_tampering(analysis.original_image.path)
                tampered_path = simulation.get('tampered_path')
                analysis.modification_type = simulation.get('modification_type')

                if tampered_path:
                    tampered_file = Path(tampered_path)
                    try:
                        relative = tampered_file.relative_to(Path(settings.MEDIA_ROOT))
                        analysis.tampered_image.name = str(relative).replace('\\', '/')
                    except ValueError:
                        analysis.tampered_image.name = str(tampered_file)
            except Exception:
                tampered_path = None

        detection_source = tampered_path or analysis.original_image.path
        metadata_source = analysis.original_image.path

        metadata_result = {
            'tampered': False,
            'confidence': 0.0,
            'details': 'No metadata analysis',
            'analysis': [],
            'exif': {},
            'image_info': {},
            'file_info': {},
            'pil_info': {},
        }
        try:
            metadata_result = analyze_metadata(metadata_source)
        except Exception:
            metadata_result = {
                'tampered': False,
                'confidence': 0.0,
                'details': 'Metadata analysis failed',
                'analysis': [],
                'exif': {},
                'image_info': {},
                'file_info': {},
                'pil_info': {},
            }
            
        noise_result = {'tampered': False, 'confidence': 0.0}
        try:
            noise_result = detect_noise(detection_source)
        except Exception:
            noise_result = {'tampered': False, 'confidence': 0.0}

        clone_result = {'tampered': False, 'confidence': 0.0, 'matches': 0, 'hotspots': []}
        try:
            clone_result = detect_clone(detection_source)
        except Exception:
            clone_result = {'tampered': False, 'confidence': 0.0, 'matches': 0, 'hotspots': []}

        clone_confidence = min(max(float(clone_result.get('confidence') or 0.0), 0.0), 1.0)
        noise_confidence = min(max(float(noise_result.get('confidence') or 0.0), 0.0), 1.0)
        metadata_confidence = min(max(float(metadata_result.get('confidence') or 0.0), 0.0), 1.0)

        clone_weight = 0.55
        noise_weight = 0.25
        metadata_weight = 0.20
        score = (
            (clone_confidence * clone_weight)
            + (noise_confidence * noise_weight)
            + (metadata_confidence * metadata_weight)
        )

        final_tampered = False
        if clone_confidence >= 0.6:
            final_tampered = True
        elif noise_confidence >= 0.70:
            final_tampered = True
        elif metadata_confidence >= 0.5 and clone_confidence >= 0.35:
            final_tampered = True
        elif score > 0.38:
            final_tampered = True

        decision_reason = build_decision_reason(
            clone_confidence,
            noise_confidence,
            metadata_confidence,
            score,
            final_tampered,
        )
        final_confidence = round(score, 4)

        print("DEBUG:")
        print("Noise:", noise_result)
        print("Clone:", clone_result)
        print(
            "Metadata summary:",
            {
                'tampered': metadata_result.get('tampered'),
                'confidence': metadata_confidence,
                'has_exif': bool(metadata_result.get('exif')),
            },
        )
        print("FINAL LOGIC:")
        print("clone_conf:", clone_confidence)
        print("noise_conf:", noise_confidence)
        print("metadata_conf:", metadata_confidence)
        print("score:", score)
        print("FINAL:", final_tampered)
        print("REASON:", decision_reason)

        original_path = Path(analysis.original_image.path)

        def build_media_url(absolute_path: Path | None) -> str | None:
            if not absolute_path:
                return None
            try:
                relative = absolute_path.relative_to(Path(settings.MEDIA_ROOT))
            except ValueError:
                return None
            media_base = settings.MEDIA_URL.rstrip('/') + '/'
            relative_posix = str(relative).replace('\\', '/')
            return request.build_absolute_uri(f"{media_base}{relative_posix}")

        ela_url = None
        try:
            ela_dir = Path(settings.MEDIA_ROOT) / 'analysis' / 'ela'
            ela_dir.mkdir(parents=True, exist_ok=True)
            ela_output = ela_dir / f"{original_path.stem}_ela.jpg"
            perform_ela(original_path, ela_output)
            ela_url = build_media_url(ela_output)
        except Exception:
            ela_url = None

        heatmap_url = None
        try:
            heatmap_dir = Path(settings.MEDIA_ROOT) / 'analysis' / 'heatmaps'
            heatmap_dir.mkdir(parents=True, exist_ok=True)
            heatmap_output = heatmap_dir / f"{original_path.stem}_heatmap.jpg"
            generated_path = generate_heatmap(
                original_path,
                hotspots=clone_result.get('hotspots'),
                output_path=heatmap_output,
            )
            heatmap_url = build_media_url(Path(generated_path))
        except Exception:
            heatmap_url = None

        analysis.predicted_result = final_tampered
        analysis.confidence = final_confidence
        analysis.noise_confidence = noise_confidence
        analysis.clone_confidence = clone_confidence
        analysis.metadata_confidence = metadata_confidence
        analysis.noise_tampered = bool(noise_result.get('tampered'))
        analysis.clone_tampered = bool(clone_result.get('tampered'))
        analysis.metadata_tampered = bool(metadata_result.get('tampered'))
        analysis.metadata = metadata_result
        analysis.exif_data = metadata_result.get('exif') or metadata_result.get('exif_data') or {}

        update_fields = [
            'predicted_result',
            'confidence',
            'noise_confidence',
            'clone_confidence',
            'metadata_confidence',
            'noise_tampered',
            'clone_tampered',
            'metadata_tampered',
            'metadata',
            'exif_data',
            'actual_result',
        ]
        if tampered_path:
            update_fields.extend(['tampered_image', 'modification_type'])
        analysis.save(update_fields=update_fields)

        serializer = ImageAnalysisSerializer(analysis, context={'request': request})
        image_url = serializer.data['original_image']

        return Response(
            {
                'message': 'Image uploaded and analyzed',
                'id': serializer.data['id'],
                'image_url': image_url,
                'predicted_result': serializer.data['predicted_result'],
                'confidence': serializer.data['confidence'],
                'noise_confidence': noise_result.get('confidence'),
                'clone_confidence': clone_result.get('confidence'),
                'metadata_confidence': metadata_result.get('confidence'),
                'metadata_details': metadata_result.get('details'),
                'metadata_analysis': metadata_result.get('analysis'),
                'metadata_exif': metadata_result.get('exif') or metadata_result.get('exif_data'),
                'metadata_file_info': metadata_result.get('file_info'),
                'metadata_image_info': metadata_result.get('image_info'),
                'metadata_pil_info': metadata_result.get('pil_info'),
                'metadata_tampered': metadata_result.get('tampered'),
                'metadata': metadata_result,
                'ela_image': ela_url,
                'heatmap_image': heatmap_url,
                'actual_result': serializer.data['actual_result'],
                'modification_type': serializer.data['modification_type'],
                'decision_reason': decision_reason,
            },
            status=status.HTTP_201_CREATED,
        )


class HistoryView(APIView):
    def get(self, request: HttpRequest, *args, **kwargs):
        queryset = ImageAnalysis.objects.all().order_by('-created_at')
        serializer = ImageAnalysisSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class AccuracyView(APIView):
    def get(self, request: HttpRequest, *args, **kwargs):
        queryset = ImageAnalysis.objects.exclude(actual_result__isnull=True)
        total = queryset.count()
        correct = queryset.filter(predicted_result=F('actual_result')).count()

        accuracy = float((correct / total) * 100) if total else 0.0

        return Response({
            'total': total,
            'correct': correct,
            'accuracy': accuracy,
        })


class AnalysisDetailView(APIView):
    def get(self, request: HttpRequest, analysis_id: int, *args, **kwargs):
        try:
            analysis = ImageAnalysis.objects.get(id=analysis_id)
            serializer = ImageAnalysisSerializer(analysis, context={'request': request})
            return Response(serializer.data)
        except ImageAnalysis.DoesNotExist:
            return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)


class DatasetEvaluationView(APIView):
    def get(self, request: HttpRequest, *args, **kwargs):
        evaluation = DatasetEvaluation.objects.order_by('-created_at').first()
        if not evaluation:
            return Response({'has_data': False}, status=status.HTTP_200_OK)

        serializer = DatasetEvaluationSerializer(evaluation, context={'request': request})
        return Response({'has_data': True, 'metrics': serializer.data})
