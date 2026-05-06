import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban } from 'lucide-react';

const links = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#0d0f16] border-r border-white/5 flex flex-col h-full shrink-0">
      <div className="p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-3 mb-3">Navigation</p>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium group ${
                    isActive
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} className={isActive ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'} />
                    {link.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/10 p-4">
          <p className="text-sm font-semibold text-violet-400">TaskFlow Pro</p>
          <p className="text-sm text-slate-500 mt-1">MERN Stack App</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
