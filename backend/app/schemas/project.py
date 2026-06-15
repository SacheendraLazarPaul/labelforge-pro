from datetime import datetime

from pydantic import BaseModel


class LabelCreate(BaseModel):
    name: str
    description: str | None = None
    color: str | None = None


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    labeling_mode: str = "single_label"
    labels: list[LabelCreate]


class LabelOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    color: str | None = None

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    labeling_mode: str
    status: str
    created_at: datetime
    labels: list[LabelOut]

    class Config:
        from_attributes = True
