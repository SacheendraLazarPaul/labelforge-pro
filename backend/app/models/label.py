from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LabelDefinition(Base):
    __tablename__ = "label_definitions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str | None] = mapped_column(String(30), nullable=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))

    project = relationship("Project", back_populates="labels")
    annotations = relationship("Annotation", back_populates="label")
