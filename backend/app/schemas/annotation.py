from datetime import datetime

from pydantic import BaseModel


class AnnotationCreate(BaseModel):
    label_id: int | None = None
    notes: str | None = None


class AnnotationOut(BaseModel):
    id: int
    label_id: int | None = None
    notes: str | None = None
    updated_at: datetime
    annotator_id: int

    class Config:
        from_attributes = True
