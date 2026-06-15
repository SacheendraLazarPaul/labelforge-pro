import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Project } from '../types';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Project[]>('/projects')
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-state">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p>Manage datasets, review AI suggestions, and export human-labeled outputs.</p>
        </div>
        <Link to="/projects/new" className="primary-button">Create Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-card">
          <h3>No projects yet</h3>
          <p>Create your first annotation workflow to start uploading data and labeling records.</p>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
              <div className="project-card-top">
                <h3>{project.name}</h3>
                <span className="badge">{project.status}</span>
              </div>
              <p>{project.description || 'No description provided.'}</p>
              <div className="label-row">
                {project.labels.map((label) => (
                  <span key={label.id} className="label-chip" style={{ borderColor: label.color || '#6d5efc' }}>
                    {label.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
