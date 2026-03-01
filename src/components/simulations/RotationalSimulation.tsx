import React, { useState } from 'react';
import { ArrowLeft, RotateCw, Info, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

type Category = 'plane' | 'real' | 'letter';

interface Shape {
  id: string;
  name: string;
  category: Category;
  hasSymmetry: boolean;
  render: () => React.ReactNode;
}

const SHAPES: Shape[] = [
  // Plane Shapes
  { id: 'rect', name: 'Hình chữ nhật', category: 'plane', hasSymmetry: true, render: () => <rect x="50" y="75" width="200" height="150" fill="#3b82f6" rx="4" /> },
  { id: 'square', name: 'Hình vuông', category: 'plane', hasSymmetry: true, render: () => <rect x="75" y="75" width="150" height="150" fill="#10b981" rx="4" /> },
  { id: 'rhombus', name: 'Hình thoi', category: 'plane', hasSymmetry: true, render: () => <path d="M150 50 L250 150 L150 250 L50 150 Z" fill="#f59e0b" /> },
  { id: 'parallelogram', name: 'Hình bình hành', category: 'plane', hasSymmetry: true, render: () => <path d="M80 75 L250 75 L220 225 L50 225 Z" fill="#8b5cf6" /> },
  { id: 'hexagon', name: 'Hình lục giác đều', category: 'plane', hasSymmetry: true, render: () => <path d="M150 50 L236 100 L236 200 L150 250 L64 200 L64 100 Z" fill="#ec4899" /> },
  { id: 'circle', name: 'Hình tròn', category: 'plane', hasSymmetry: true, render: () => <circle cx="150" cy="150" r="100" fill="#f43f5e" /> },
  { id: 'triangle', name: 'Tam giác đều', category: 'plane', hasSymmetry: false, render: () => <path d="M150 50 L250 223 L50 223 Z" fill="#06b6d4" /> },
  { id: 'trapezoid', name: 'Hình thang cân', category: 'plane', hasSymmetry: false, render: () => <path d="M100 75 L200 75 L250 225 L50 225 Z" fill="#f97316" /> },
  
  // Real Objects
  { id: 'fan2', name: 'Chong chóng 2 cánh', category: 'real', hasSymmetry: true, render: () => (
    <g fill="#3b82f6">
      <path d="M150 150 L150 50 Q180 50 180 100 Z" />
      <path d="M150 150 L150 250 Q120 250 120 200 Z" />
    </g>
  )},
  { id: 'fan4', name: 'Chong chóng 4 cánh', category: 'real', hasSymmetry: true, render: () => (
    <g fill="#10b981">
      <path d="M150 150 L150 50 Q180 50 180 100 Z" />
      <path d="M150 150 L250 150 Q250 180 200 180 Z" />
      <path d="M150 150 L150 250 Q120 250 120 200 Z" />
      <path d="M150 150 L50 150 Q50 120 100 120 Z" />
    </g>
  )},
  { id: 'flower5', name: 'Hoa 5 cánh', category: 'real', hasSymmetry: false, render: () => (
    <g fill="#ec4899">
      {[0, 72, 144, 216, 288].map(angle => (
        <ellipse key={angle} cx="150" cy="100" rx="20" ry="40" transform={`rotate(${angle}, 150, 150)`} />
      ))}
      <circle cx="150" cy="150" r="20" fill="#fbbf24" />
    </g>
  )},
  { id: 'fan3', name: 'Chong chóng 3 cánh', category: 'real', hasSymmetry: false, render: () => (
    <g fill="#8b5cf6">
      {[0, 120, 240].map(angle => (
        <path key={angle} d="M150 150 L150 50 Q180 50 180 100 Z" transform={`rotate(${angle}, 150, 150)`} />
      ))}
    </g>
  )},
  { id: 'kite', name: 'Cánh diều', category: 'real', hasSymmetry: false, render: () => <path d="M150 50 L220 120 L150 250 L80 120 Z" fill="#f59e0b" /> },
  { id: 'house', name: 'Ngôi nhà', category: 'real', hasSymmetry: false, render: () => (
    <g>
      <rect x="75" y="150" width="150" height="100" fill="#3b82f6" />
      <path d="M75 150 L150 75 L225 150 Z" fill="#ef4444" />
      <rect x="130" y="180" width="40" height="70" fill="#fff" />
    </g>
  )},

  // Letters
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(char => ({
    id: `letter-${char}`,
    name: `Chữ ${char}`,
    category: 'letter' as Category,
    hasSymmetry: ['H', 'I', 'N', 'O', 'S', 'X', 'Z'].includes(char),
    render: () => (
      <text x="150" y="150" fontSize="150" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="#1e293b" fontFamily="Inter">
        {char}
      </text>
    )
  }))
];

export default function RotationalSimulation() {
  const [activeCategory, setActiveCategory] = useState<Category>('plane');
  const [selectedShape, setSelectedShape] = useState<Shape>(SHAPES[0]);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleRotate = () => {
    setIsAnimating(true);
    setShowResult(false);
    setRotation(180);
    setTimeout(() => {
      setIsAnimating(false);
      setShowResult(true);
    }, 3000); // Slow rotation
  };

  const handleReset = () => {
    setRotation(0);
    setShowResult(false);
    setIsAnimating(false);
  };

  const filteredShapes = SHAPES.filter(s => s.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all">
          <ArrowLeft size={20} />
          Quay lại
        </Link>
        <h2 className="text-2xl font-black text-slate-800 font-sans uppercase">Mô phỏng hình có tâm đối xứng</h2>
        <div className="w-24"></div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-bottom border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Danh mục</h3>
            </div>
            <div className="p-2 space-y-1">
              {[
                { id: 'plane', name: 'Hình phẳng' },
                { id: 'real', name: 'Hình thực tế' },
                { id: 'letter', name: 'Chữ cái' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as Category);
                    setSelectedShape(SHAPES.find(s => s.category === cat.id)!);
                    setShowResult(false);
                    setRotation(0);
                    setIsAnimating(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all font-medium ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-h-[400px] flex flex-col">
            <div className="p-4 bg-slate-50 border-bottom border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Chọn hình</h3>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto flex-grow">
              {filteredShapes.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedShape(shape);
                    setShowResult(false);
                    setRotation(0);
                    setIsAnimating(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all text-sm font-medium ${selectedShape.id === shape.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Simulation Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col items-center">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedShape.name}</h3>
              <p className="text-slate-500 text-sm">Nhấn nút để kiểm tra tính đối xứng tâm</p>
            </div>

            <div className="relative w-[400px] h-[400px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
              {/* Ghost Original Position */}
              <svg width="300" height="300" viewBox="0 0 300 300" className="absolute opacity-10">
                {selectedShape.render()}
              </svg>

              {/* Rotating Shape */}
              <motion.svg
                key={selectedShape.id}
                width="300"
                height="300"
                viewBox="0 0 300 300"
                initial={{ rotate: 0 }}
                animate={{ rotate: rotation }}
                transition={{ duration: 3, ease: "linear" }}
                className="relative z-10"
              >
                {selectedShape.render()}
              </motion.svg>

              {/* Center Point */}
              <div className="absolute w-3 h-3 bg-red-500 rounded-full z-20 shadow-sm border-2 border-white"></div>
              
              {/* Initial Position Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140px] w-1 h-4 bg-red-500 rounded-full z-20"></div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleRotate}
                disabled={isAnimating || rotation === 180}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                <RotateCw size={20} className={isAnimating ? 'animate-spin' : ''} />
                QUAY NỬA VÒNG TRÒN
              </button>

              {rotation === 180 && !isAnimating && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all"
                >
                  ĐẶT LẠI
                </button>
              )}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-8 p-6 rounded-2xl border-2 flex items-center gap-4 ${selectedShape.hasSymmetry ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}
                >
                  {selectedShape.hasSymmetry ? (
                    <>
                      <CheckCircle2 size={32} className="text-emerald-600" />
                      <div>
                        <p className="font-bold text-lg">Hình có tâm đối xứng!</p>
                        <p className="text-sm opacity-80">Hình thu được chồng khít với chính nó ở vị trí ban đầu sau khi quay 180°.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={32} className="text-rose-600" />
                      <div>
                        <p className="font-bold text-lg">Hình không có tâm đối xứng!</p>
                        <p className="text-sm opacity-80">Hình thu được không chồng khít với vị trí ban đầu sau khi quay 180°.</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex gap-3">
              <Info className="text-blue-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Kiến thức cần nhớ</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Một hình có tâm đối xứng nếu có một điểm O sao cho khi quay hình đó quanh điểm O một góc 180°, ta được một hình chồng khít với chính nó ở vị trí ban đầu. Điểm O đó được gọi là tâm đối xứng của hình.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
