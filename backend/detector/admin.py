from django.contrib import admin

from .models import ImageAnalysis


@admin.register(ImageAnalysis)
class ImageAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'modification_type',
        'predicted_result',
        'actual_result',
        'confidence',
        'created_at',
    )
    list_filter = ('modification_type', 'predicted_result', 'actual_result')
    search_fields = ('modification_type',)
