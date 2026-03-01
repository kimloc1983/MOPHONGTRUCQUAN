import React from 'react';
import { ArrowRight, Binary, Shapes, MoveHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Dashboard() {
  const simulations = [
    {
      id: 'integer',
      title: 'CỘNG SỐ NGUYÊN',
      subtitle: 'Khám phá thế giới số âm và dương qua mô phỏng trực quan',
      icon: <Binary className="text-indigo-600" size={32} />,
      path: '/learn/integer',
      color: 'from-indigo-500/10 to-indigo-500/5',
      accent: 'bg-indigo-600',
      shadow: 'shadow-indigo-100',
    },
    {
      id: 'rotational',
      title: 'TÂM ĐỐI XỨNG',
      subtitle: 'Tìm hiểu về các hình có khả năng tự chồng khít khi quay',
      icon: <Shapes className="text-cyan-600" size={32} />,
      path: '/learn/rotational',
      color: 'from-cyan-500/10 to-cyan-500/5',
      accent: 'bg-cyan-600',
      shadow: 'shadow-cyan-100',
    },
    {
      id: 'reflectional',
      title: 'TRỤC ĐỐI XỨNG',
      subtitle: 'Khám phá vẻ đẹp của sự cân bằng qua phép gập hình',
      icon: <MoveHorizontal className="text-rose-600" size={32} />,
      path: '/learn/reflectional',
      color: 'from-rose-500/10 to-rose-500/5',
      accent: 'bg-rose-600',
      shadow: 'shadow-rose-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 relative">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 font-sans tracking-tight">
          Chào mừng bạn! 👋
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {simulations.map((sim, idx) => (
          <motion.div
            key={sim.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={sim.path}
              className={`group relative flex flex-col h-full p-8 rounded-4xl bg-gradient-to-br ${sim.color} border border-white shadow-2xl ${sim.shadow} hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                {React.cloneElement(sim.icon as React.ReactElement, { size: 120 })}
              </div>
              
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                {sim.icon}
              </div>
              
              <div className="flex-grow relative z-10">
                <h4 className="text-xl font-black text-slate-800 mb-2 font-sans">{sim.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{sim.subtitle}</p>
              </div>

              <div className="flex items-center justify-between mt-auto relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase">Khám phá ngay</span>
                </div>
                <div className={`w-10 h-10 rounded-full ${sim.accent} text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform`}>
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
