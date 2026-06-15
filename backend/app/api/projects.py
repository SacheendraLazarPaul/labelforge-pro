import csv
import io
import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.annotation import Annotation
from app.models.label import LabelDefinition
from app.models.project import Project
from app.models.record import DataRecord
from app.models.user import User
from app.schemas.annotation import AnnotationCreate
from app.schemas.project import ProjectCreate, ProjectOut
from app.schemas.record import AnalyticsOut, RecordOut
from app.services.heuristics import simple_predict

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_project_for_user(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).options(joinedload(Project.labels)).filter(Project.id == project_id, Project.owner_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = Project(
        name=payload.name,
        description=payload.description,
        labeling_mode=payload.labeling_mode,
        owner_id=current_user.id,
    )
    db.add(project)
    db.flush()

    for label in payload.labels:
        db.add(LabelDefinition(name=label.name, description=label.description, color=label.color, project_id=project.id))

    db.commit()
    db.refresh(project)
    return _get_project_for_user(project.id, current_user.id, db)


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Project)
        .options(joinedload(Project.labels))
        .filter(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_project_for_user(project_id, current_user.id, db)


@router.post("/{project_id}/upload")
def upload_records(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = _get_project_for_user(project_id, current_user.id, db)
    content = file.file.read().decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))

    if not reader.fieldnames or "content" not in [name.lower() for name in reader.fieldnames]:
        raise HTTPException(status_code=400, detail="CSV must include a content column")

    content_column = next(name for name in reader.fieldnames if name.lower() == "content")
    external_id_column = next((name for name in reader.fieldnames if name.lower() in {"id", "external_id", "record_id"}), None)
    label_names = [label.name for label in project.labels]

    inserted = 0
    for row in reader:
        text = (row.get(content_column) or "").strip()
        if not text:
            continue
        ai_prediction, ai_confidence = simple_predict(text, label_names)
        metadata = {k: v for k, v in row.items() if k not in {content_column, external_id_column}}
        db.add(
            DataRecord(
                external_id=row.get(external_id_column) if external_id_column else None,
                content=text,
                metadata_json=json.dumps(metadata) if metadata else None,
                ai_prediction=ai_prediction,
                ai_confidence=ai_confidence,
                project_id=project.id,
            )
        )
        inserted += 1

    db.commit()
    return {"message": "Upload successful", "inserted": inserted}


@router.get("/{project_id}/records", response_model=list[RecordOut])
def list_records(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _get_project_for_user(project_id, current_user.id, db)
    return (
        db.query(DataRecord)
        .options(joinedload(DataRecord.annotations))
        .filter(DataRecord.project_id == project_id)
        .order_by(DataRecord.id.asc())
        .all()
    )


@router.post("/{project_id}/records/{record_id}/annotate", response_model=RecordOut)
def annotate_record(project_id: int, record_id: int, payload: AnnotationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = _get_project_for_user(project_id, current_user.id, db)
    record = (
        db.query(DataRecord)
        .options(joinedload(DataRecord.annotations))
        .filter(DataRecord.id == record_id, DataRecord.project_id == project.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    if payload.label_id is not None:
        valid_label = db.query(LabelDefinition).filter(LabelDefinition.id == payload.label_id, LabelDefinition.project_id == project.id).first()
        if not valid_label:
            raise HTTPException(status_code=400, detail="Invalid label for this project")

    existing = next((a for a in record.annotations if a.annotator_id == current_user.id), None)
    if existing:
        existing.label_id = payload.label_id
        existing.notes = payload.notes
    else:
        db.add(Annotation(record_id=record.id, label_id=payload.label_id, notes=payload.notes, annotator_id=current_user.id))

    db.commit()
    return (
        db.query(DataRecord)
        .options(joinedload(DataRecord.annotations))
        .filter(DataRecord.id == record.id)
        .first()
    )


@router.get("/{project_id}/analytics", response_model=AnalyticsOut)
def analytics(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = _get_project_for_user(project_id, current_user.id, db)
    records = (
        db.query(DataRecord)
        .options(joinedload(DataRecord.annotations).joinedload(Annotation.label))
        .filter(DataRecord.project_id == project.id)
        .all()
    )

    total = len(records)
    annotated = 0
    ai_agreements = 0
    label_breakdown: dict[str, int] = {}

    for record in records:
        annotation = next((a for a in record.annotations if a.annotator_id == current_user.id), None)
        if annotation and annotation.label:
            annotated += 1
            label_breakdown[annotation.label.name] = label_breakdown.get(annotation.label.name, 0) + 1
            if record.ai_prediction and annotation.label.name.lower() == record.ai_prediction.lower():
                ai_agreements += 1

    return AnalyticsOut(
        total_records=total,
        annotated_records=annotated,
        pending_records=total - annotated,
        agreement_with_ai_percent=round((ai_agreements / annotated) * 100, 2) if annotated else 0.0,
        label_breakdown=label_breakdown,
    )


@router.get("/{project_id}/export")
def export_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = _get_project_for_user(project_id, current_user.id, db)
    records = (
        db.query(DataRecord)
        .options(joinedload(DataRecord.annotations).joinedload(Annotation.label))
        .filter(DataRecord.project_id == project.id)
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["record_id", "external_id", "content", "ai_prediction", "ai_confidence", "human_label", "notes"])

    for record in records:
        annotation = next((a for a in record.annotations if a.annotator_id == current_user.id), None)
        writer.writerow([
            record.id,
            record.external_id or "",
            record.content,
            record.ai_prediction or "",
            record.ai_confidence or "",
            annotation.label.name if annotation and annotation.label else "",
            annotation.notes if annotation else "",
        ])

    output.seek(0)
    filename = f"{project.name.lower().replace(' ', '_')}_annotations.csv"
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})
