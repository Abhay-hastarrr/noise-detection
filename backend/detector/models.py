from django.db import models


class ImageAnalysis(models.Model):
    original_image = models.ImageField(upload_to='original/')
    tampered_image = models.ImageField(upload_to='tampered/', null=True, blank=True)
    modification_type = models.CharField(max_length=100, null=True, blank=True)
    
    # Main prediction
    predicted_result = models.BooleanField(null=True)
    actual_result = models.BooleanField(null=True)
    confidence = models.FloatField(null=True)
    
    # Individual analysis confidences
    noise_confidence = models.FloatField(null=True, default=0.0)
    clone_confidence = models.FloatField(null=True, default=0.0)
    metadata_confidence = models.FloatField(null=True, default=0.0)
    
    # Metadata analysis results
    exif_data = models.JSONField(null=True, blank=True)
    metadata_details = models.TextField(null=True, blank=True)
    metadata_analysis = models.JSONField(null=True, blank=True, default=list)
    metadata_file_info = models.JSONField(null=True, blank=True)
    metadata_image_info = models.JSONField(null=True, blank=True)
    metadata_pil_info = models.JSONField(null=True, blank=True)
    metadata_tampered = models.BooleanField(null=True)
    
    # Full metadata object
    metadata = models.JSONField(null=True, blank=True)
    
    # Noise detection result
    noise_tampered = models.BooleanField(null=True)
    
    # Clone detection result
    clone_tampered = models.BooleanField(null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"ImageAnalysis #{self.pk or 'unsaved'}"


class DatasetEvaluation(models.Model):
    label = models.CharField(max_length=120, blank=True)
    total_samples = models.PositiveIntegerField(default=0)
    true_positive = models.PositiveIntegerField(default=0)
    true_negative = models.PositiveIntegerField(default=0)
    false_positive = models.PositiveIntegerField(default=0)
    false_negative = models.PositiveIntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    precision = models.FloatField(default=0.0)
    recall = models.FloatField(default=0.0)
    f1 = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        label = f"{self.label} " if self.label else ""
        return f"DatasetEvaluation {label}@ {self.created_at:%Y-%m-%d %H:%M:%S}"
