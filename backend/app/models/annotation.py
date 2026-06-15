from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Annotation(Base):
    __tablename__ = "annotations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    record_id: Mapped[int] = mapped_column(ForeignKey("data_records.id"), index=True)
    label_id: Mapped[int | None] = mapped_column(ForeignKey("label_definitions.id"), nullable=True)
    annotator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    record = relationship("DataRecord", back_populates="annotations")
    label = relationship("LabelDefinition", back_populates="annotations")
