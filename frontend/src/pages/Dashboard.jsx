import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  'Todo': {
    label: 'To Do',
    icon: Circle,
    color: 'text-slate-400',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    col: 'border-t-slate-500',
  },
  'In Progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    col: 'border-t-blue-500',
  },
  'Done': {
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    col: 'border-t-emerald-500',
  },
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const isOverdue = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  const grouped = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done'),
  };

  const overdueCnt = tasks.filter(t => t.status !== 'Done' && isOverdue(t.dueDate)).length;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Dashboard</h1>
          <p className="text-base text-slate-500 mt-1.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
        {overdueCnt > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400">{overdueCnt} overdue</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(grouped).map(([status, list]) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <div key={status} className="bg-[#161b27] border border-white/5 rounded-xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/5">
                <Icon size={20} className={cfg.color} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white leading-none">{list.length}</p>
                <p className="text-sm text-slate-500 mt-1.5">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Object.entries(grouped).map(([status, list]) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <div key={status} className={`bg-[#161b27] border border-white/5 border-t-2 ${cfg.col} rounded-xl flex flex-col`}>
              {/* Column Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className={cfg.color} />
                  <span className="text-base font-semibold text-slate-300">{cfg.label}</span>
                </div>
                <span className={`text-sm font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                  {list.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[55vh] flex-1">
                {list.length === 0 ? (
                  <p className="text-center text-slate-700 text-sm py-8">No tasks here</p>
                ) : (
                  list.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isAdmin={isAdmin}
                      onStatusChange={updateTaskStatus}
                      isOverdue={status !== 'Done' && isOverdue(task.dueDate)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BADGE_STYLES = {
  'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Todo': 'bg-slate-800 text-slate-400 border-slate-700',
};

const TaskCard = ({ task, onStatusChange, isOverdue, isAdmin }) => {
  return (
    <div className={`relative rounded-xl p-4 border group hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 ${
      isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0f1117] border-white/5'
    }`}>
      {isOverdue && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-red-500" />
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-medium px-2 py-1 bg-white/5 text-slate-500 rounded-md border border-white/5 truncate max-w-[130px]">
          {task.project?.name || 'No Project'}
        </span>
        {/* Status badge — always static; only members get dropdown */}
        {task.status === 'Done' ? (
          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            ✓ Done
          </span>
        ) : isAdmin ? (
          <span className={`text-xs font-semibold px-2 py-1 rounded-md border shrink-0 ${BADGE_STYLES[task.status]}`}>
            {task.status}
          </span>
        ) : (
          <select
            className="text-xs bg-transparent border border-white/10 rounded-md text-slate-400 focus:outline-none focus:border-violet-500/40 px-2 py-1 cursor-pointer hover:border-violet-500/30 shrink-0"
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
          >
            <option value="Todo" className="bg-[#161b27]">Todo</option>
            <option value="In Progress" className="bg-[#161b27]">In Progress</option>
            <option value="Done" className="bg-[#161b27]">Done</option>
          </select>
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-200 mb-2 leading-snug group-hover:text-white">
        {task.title}
      </h3>

      {task.description && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Assignee — visible to admin for tracking */}
      {isAdmin && task.assignedTo && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center text-[9px] font-bold text-violet-400">
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-500">{task.assignedTo.name}</span>
        </div>
      )}

      <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 text-sm font-medium ${
        isOverdue ? 'text-red-400' : 'text-slate-600'
      }`}>
        {isOverdue && <AlertTriangle size={13} />}
        <span>
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'No due date'}
          {isOverdue && ' · Overdue'}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
