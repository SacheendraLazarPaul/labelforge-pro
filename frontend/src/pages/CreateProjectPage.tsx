import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface LabelInput {
  name: string;
  description: string;
  color: string;
}

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState<LabelInput[]>([
    { name: 'Spam', description: 'Unwanted or promotional text', color: '#ef4444' },
    { name: 'Not Spam', description: 'Valid content', color: '#10b981' },
  ]);
  const [error, setError] = useState('');

  const updateLabel = (index: number, key: keyof LabelInput, value: string) => {
    setLabels((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const addLabel = () => {
    setLabels((prev) => [...prev, { name: '', description: '', color: '#6d5efc' }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/projects', {
        name,
        description,
        labeling_mode: 'single_label',
        labels,
      });
      navigate(`/projects/${data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not create project');
    }
  };

  return (
    <div className="panel">
      <h2>Create Project</h2>
      <p>Define your taxonomy once, then upload CSV data and annotate at scale.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="Project description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

        <div className="labels-section">
          <div className="section-header">
            <h3>Labels</h3>
            <button type="button" className="secondary-button" onClick={addLabel}>Add Label</button>
          </div>
          {labels.map((label, index) => (
            <div key={index} className="label-editor">
              <input placeholder="Name" value={label.name} onChange={(e) => updateLabel(index, 'name', e.target.value)} required />
              <input placeholder="Description" value={label.description} onChange={(e) => updateLabel(index, 'description', e.target.value)} />
              <input type="color" value={label.color} onChange={(e) => updateLabel(index, 'color', e.target.value)} />
            </div>
          ))}
        </div>
        {error && <div className="error-banner">{error}</div>}
        <button className="primary-button" type="submit">Create project</button>
      </form>
    </div>
  );
}
