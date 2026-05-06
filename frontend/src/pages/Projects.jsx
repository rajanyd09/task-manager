import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FolderPlus, Users, Calendar, ArrowRight, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchProjects();
    if (user.role === 'Admin') fetchAllUsers();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setAllUsers(data);
    } catch {
      toast.error('Failed to fetch users');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', { name, description, members: selectedMembers });
      setProjects([...projects, data]);
      setShowModal(false);
      setName(''); setDescription(''); setSelectedMembers([]);
      toast.success('Project created!');
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-base text-slate-500 mt-1.5">
            {projects.length} active project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {user.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-violet-500/20 active:scale-95"
          >
            <FolderPlus size={17} />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl">
          <FolderKanban size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 font-semibold text-lg">No projects yet</p>
          <p className="text-slate-600 text-base mt-2">Create a project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="group block">
              <div className="bg-[#161b27] border border-white/5 rounded-xl p-6 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 active:scale-[0.99] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500/60 to-violet-500/0 opacity-0 group-hover:opacity-100" />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10 flex items-center justify-center">
                    <FolderKanban size={20} className="text-violet-400" />
                  </div>
                  <ArrowRight size={17} className="text-slate-700 group-hover:text-violet-400 group-hover:translate-x-0.5 mt-1" />
                </div>

                <h3 className="font-semibold text-slate-200 group-hover:text-white text-lg mb-2 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-5 min-h-[2.5rem]">
                  {project.description || 'No description'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-white text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleCreateProject} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the project..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Assign Members</label>
                <div className="max-h-44 overflow-y-auto bg-white/5 border border-white/10 rounded-lg divide-y divide-white/5">
                  {allUsers.map(u => (
                    <label key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded accent-violet-500 w-4 h-4"
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => handleMemberToggle(u._id)}
                      />
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300">{u.name}</span>
                        <span className="text-xs text-slate-600">({u.role})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/10 font-medium">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
