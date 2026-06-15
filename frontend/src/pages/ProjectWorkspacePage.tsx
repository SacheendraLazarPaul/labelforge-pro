import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/client';
import { Analytics, Project, RecordItem } from '../types';

export function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [projectRes, recordsRes, analyticsRes] = await Promise.all([
      api.get<Project>(`/projects/${projectId}`),
      api.get<RecordItem[]>(`/projects/${projectId}/records`),
      api.get<Analytics>(`/projects/${projectId}/analytics`),
    ]);
    setProject(projectRes.data);
    setRecords(recordsRes.data);
    setAnalytics(analyticsRes.data);
    if (recordsRes.data.length && !selectedRecordId) {
      setSelectedRecordId(recordsRes.data[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedRecordId) || null,
    [records, selectedRecordId]
  );

  useEffect(() => {
    if (!selectedRecord) return;
    const currentAnnotation = selectedRecord.annotations[0];
    setSelectedLabelId(currentAnnotation?.label_id ?? null);
    setNotes(currentAnnotation?.notes ?? '');
  }, [selectedRecord]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/projects/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setMessage('Dataset uploaded successfully.');
    await loadData();
  };

  const saveAnnotation = async () => {
    if (!selectedRecord) return;
    await api.post(`/projects/${projectId}/records/${selectedRecord.id}/annotate`, {
      label_id: selectedLabelId,
      notes,
    });
    setMessage('Annotation saved.');
    await loadData();
  };

  const chartData = analytics
    ? Object.entries(analytics.label_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <h2>{project?.name || 'Workspace'}</h2>
          <p>{project?.description}</p>
        </div>
        <div className="actions-inline">
          <label className="secondary-button file-button">
            Upload CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} hidden />
          </label>
          <a href={`http://127.0.0.1:8000/api/v1/projects/${projectId}/export`} className="primary-button">Export CSV</a>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span>Total records</span><strong>{analytics?.total_records ?? 0}</strong></div>
        <div className="stat-card"><span>Annotated</span><strong>{analytics?.annotated_records ?? 0}</strong></div>
        <div className="stat-card"><span>Pending</span><strong>{analytics?.pending_records ?? 0}</strong></div>
        <div className="stat-card"><span>AI agreement</span><strong>{analytics?.agreement_with_ai_percent ?? 0}%</strong></div>
      </div>

      <div className="workspace-grid">
        <section className="records-list panel">
          <h3>Records</h3>
          {records.length === 0 ? (
            <p>Upload a CSV with a <code>content</code> column to begin.</p>
          ) : records.map((record) => (
            <button
              key={record.id}
              className={selectedRecordId === record.id ? 'record-item active' : 'record-item'}
              onClick={() => setSelectedRecordId(record.id)}
            >
              <strong>#{record.id}</strong>
              <span>{record.content.slice(0, 110)}...</span>
            </button>
          ))}
        </section>

        <section className="annotation-panel panel">
          <h3>Annotation Workspace</h3>
          {selectedRecord ? (
            <>
              <div className="record-detail">
                <div className="record-meta-row">
                  <span className="badge">AI: {selectedRecord.ai_prediction || 'N/A'}</span>
                  <span className="badge">Confidence: {selectedRecord.ai_confidence || 'N/A'}</span>
                </div>
                <p>{selectedRecord.content}</p>
              </div>

              <div className="label-row">
                {project?.labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => setSelectedLabelId(label.id)}
                    className={selectedLabelId === label.id ? 'label-choice active' : 'label-choice'}
                    style={{ borderColor: label.color || '#6d5efc' }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reviewer notes, rationale, or escalation details"
              />
              <button className="primary-button" onClick={saveAnnotation}>Save Annotation</button>
            </>
          ) : (
            <p>Select a record to review.</p>
          )}
        </section>

        <section className="analytics-panel panel">
          <h3>Label Breakdown</h3>
          {chartData.length === 0 ? (
            <p>No annotations yet.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={["#6d5efc", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
