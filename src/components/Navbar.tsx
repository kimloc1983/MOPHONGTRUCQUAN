import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-200 group-hover:rotate-6 transition-transform">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-xl text-slate-900 leading-none tracking-tight">TOÁN HỌC 6</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Hành trình khám phá</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
