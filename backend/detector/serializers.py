from pathlib import Path

from django.conf import settings
from rest_framework import serializers

from .models import ImageAnalysis
from .utils.reasoning import build_decision_reason


class ImageAnalysisSerializer(serializers.ModelSerializer):
    original_image = serializers.SerializerMethodField()
    tampered_image = serializers.SerializerMethodField()
    ela_image = serializers.SerializerMethodField()
    heatmap_image = serializers.SerializerMethodField()
    decision_reason = serializers.SerializerMethodField()

    class Meta:
        model = ImageAnalysis
        fields = (
            'id',
            'original_image',
            'tampered_image',
            'modification_type',
            'predicted_result',
            'actual_result',
            'confidence',
            'noise_confidence',
            'clone_confidence',
            'metadata_confidence',
            'exif_data',
            'metadata_details',
            'metadata_analysis',
            'metadata_file_info',
            'metadata_image_info',
            'metadata_pil_info',
            'metadata_tampered',
            'metadata',
            'noise_tampered',
            'clone_tampered',
            'ela_image',
            'heatmap_image',
            'decision_reason',
            'created_at',
        )

    def _build_media_url(self, path: Path | None) -> str | None:
        if not path or not path.exists():
            return None

        try:
            relative = path.relative_to(Path(settings.MEDIA_ROOT))
        except ValueError:
            return None

        url_path = f"{settings.MEDIA_URL.rstrip('/')}/{relative.as_posix()}"
        request = self.context.get('request')
        return request.build_absolute_uri(url_path) if request else url_path

    def get_original_image(self, obj):
        if obj.original_image:
            request = self.context.get('request')
            url = obj.original_image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_tampered_image(self, obj):
        if obj.tampered_image:
            request = self.context.get('request')
            url = obj.tampered_image.url
            # Fix double media prefix issue (remove leading 'media/')
            if url.startswith('/media/media/'):
                url = url.replace('/media/media/', '/media/')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_ela_image(self, obj):
        if not obj.original_image:
            return None

        try:
            original_path = Path(obj.original_image.path)
        except (ValueError, AttributeError, OSError):
            return None

        ela_path = Path(settings.MEDIA_ROOT) / 'analysis' / 'ela' / f"{original_path.stem}_ela.jpg"
        return self._build_media_url(ela_path)

    def get_heatmap_image(self, obj):
        if not obj.original_image:
            return None

        try:
            original_path = Path(obj.original_image.path)
        except (ValueError, AttributeError, OSError):
            return None

        heatmap_path = Path(settings.MEDIA_ROOT) / 'analysis' / 'heatmaps' / f"{original_path.stem}_heatmap.jpg"
        return self._build_media_url(heatmap_path)

    def get_decision_reason(self, obj):
        return build_decision_reason(
            getattr(obj, 'clone_confidence', None),
            getattr(obj, 'noise_confidence', None),
            getattr(obj, 'metadata_confidence', None),
            getattr(obj, 'confidence', None),
            getattr(obj, 'predicted_result', None),
        )
