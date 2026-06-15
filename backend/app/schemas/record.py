from pydantic import BaseModel

from app.schemas.annotation import AnnotationOut


class RecordOut(BaseModel):
    id: int
    external_id: str | None = None
    content: str
    metadata_json: str | None = None
    ai_prediction: str | None = None
    ai_confidence: str | None = None
    annotations: list[AnnotationOut] = []

    class Config:
        from_attributes = True


class AnalyticsOut(BaseModel):
    total_records: int
    annotated_records: int
    pending_records: int
    agreement_with_ai_percent: float
    label_breakdown: dict[str, int]
