from django.urls import path

from .views import AccuracyView, HistoryView, UploadImageView, AnalysisDetailView, DatasetEvaluationView

urlpatterns = [
    path('upload/', UploadImageView.as_view(), name='upload-image'),
    path('history/', HistoryView.as_view(), name='history'),
    path('history/<int:analysis_id>/', AnalysisDetailView.as_view(), name='analysis-detail'),
    path('accuracy/', AccuracyView.as_view(), name='accuracy'),
    path('dataset-evaluation/', DatasetEvaluationView.as_view(), name='dataset-evaluation'),
    path('analysis/<int:analysis_id>/', AnalysisDetailView.as_view(), name='api-analysis-detail'),
]
