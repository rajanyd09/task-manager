import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  'Todo': 'bg-slate-800 text-slate-300 border-slate-700',
  'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Done': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTasks();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error('Failed to load project');
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?projectId=${id}`);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        dueDate: taskDue,
        project: id,
        assignedTo: assignedTo || null
      });
      setTasks([...tasks, data]);
      setShowModal(false);
      setTaskTitle(''); setTaskDesc(''); setTaskDue(''); setAssignedTo('');
      toast.success('Task created!');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const isOverdue = (date, status) => {
    if (!date || status === 'Done') return false;
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  };

  if (loading || !project) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-400 text-sm font-medium mb-6">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
          <p className="text-base text-slate-500 mt-2 max-w-xl">{project.description || 'No description'}</p>
          <div className="flex items-center gap-2.5 mt-4">
            <Users size={15} className="text-slate-600" />
            <div className="flex items-center gap-1.5">
              {project.members.slice(0, 6).map(m => (
                <span key={m._id} title={m.name}
                  className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                  {m.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {project.members.length > 6 && (
                <span className="text-sm text-slate-600">+{project.members.length - 6} more</span>
              )}
            </div>
            <span className="text-sm text-slate-600">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {user.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-violet-500/20 active:scale-95 shrink-0"
          >
            <Plus size={17} />
            Add Task
          </button>
        )}
      </div>

      {/* Task Table */}
      <div className="bg-[#161b27] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Task</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Assigned To</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Due Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                {user.role === 'Admin' && <th className="px-6 py-4" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center text-slate-600 text-base">
                    No tasks yet. Click "Add Task" to get started.
                  </td>
                </tr>
              ) : tasks.map(task => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <tr key={task._id} className="group hover:bg-white/[0.02]">
                    <td className="px-6 py-5">
                      <p className={`font-semibold text-base ${overdue ? 'text-red-400' : 'text-slate-200'}`}>{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-slate-600 truncate max-w-[240px] mt-1">{task.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400 border border-violet-500/20">
                            {task.assignedTo.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-400">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-700 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-medium ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                        {overdue && ' · Overdue'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {task.status === 'Done' ? (
                        <span className="text-sm font-semibold px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          ✓ Done
                        </span>
                      ) : user.role === 'Admin' ? (
                        // Admin sees read-only badge — cannot change status
                        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${STATUS_STYLES[task.status] || STATUS_STYLES['Todo']}`}>
                          {task.status}
                        </span>
                      ) : (
                        // Member sees editable dropdown
                        <select
                          className={`text-sm font-semibold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer ${STATUS_STYLES[task.status] || STATUS_STYLES['Todo']}`}
                          style={{ backgroundColor: 'transparent' }}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        >
                          <option value="Todo" className="bg-[#161b27]">Todo</option>
                          <option value="In Progress" className="bg-[#161b27]">In Progress</option>
                          <option value="Done" className="bg-[#161b27]">Done</option>
                        </select>
                      )}
                    </td>
                    {user.role === 'Admin' && (
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Add Task</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-white text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design homepage mockup"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional task description..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 resize-none"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Assign To</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="" className="bg-[#161b27]">Select a member</option>
                    {project.members
                      .filter(m => m._id !== user._id) // exclude admin
                      .map(m => (
                        <option key={m._id} value={m._id} className="bg-[#161b27]">{m.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-base text-slate-400 hover:text-white hover:bg-white/10 font-medium">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-base font-semibold shadow-lg shadow-violet-500/20">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
