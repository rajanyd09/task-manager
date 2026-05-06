import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <nav className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-white font-bold text-sm">TM</span>
        </div>
        <span className="font-semibold text-white text-lg tracking-tight">TaskFlow</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${
            user.role === 'Admin'
              ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {user.role}
          </span>

          <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-violet-500/20">
              {getInitials(user.name)}
            </div>
            <span className="text-base font-medium text-slate-300 hidden sm:block">{user.name}</span>
          </div>

          <button
            onClick={logout}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
