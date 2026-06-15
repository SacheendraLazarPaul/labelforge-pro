from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DataRecord(Base):
    __tablename__ = "data_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    external_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_prediction: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ai_confidence: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)

    project = relationship("Project", back_populates="records")
    annotations = relationship("Annotation", back_populates="record", cascade="all, delete-orphan")
