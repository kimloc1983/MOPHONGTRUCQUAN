import React, { useState } from 'react';
import { ArrowLeft, Scissors, Info, CheckCircle2, PencilLine, Hash, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

type Category = 'plane' | 'real' | 'letter';

interface Axis {
  id: string;
  name: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isSymmetric?: boolean; // Default to true if not specified
}

interface Shape {
  id: string;
  name: string;
  category: Category;
  axes: Axis[];
  render: () => React.ReactNode;
}

interface UniversalFoldProps {
  item: () => React.ReactNode;
  axis: Axis;
  isFolding: boolean;
  isFolded: boolean;
  showAxis: boolean;
}

/**
 * UniversalFold Component
 * Thực hiện hiệu ứng gập đôi 3D theo thuật toán xoay Container bù trừ.
 * Giúp gập mọi hình phức tạp theo trục bất kỳ mà không bị rách nét.
 */
const UniversalFold: React.FC<UniversalFoldProps> = ({
  item,
  axis,
  isFolding,
  isFolded,
  showAxis
}) => {
  let dx = axis.x2 - axis.x1;
  let dy = axis.y2 - axis.y1;
  
  // Chuẩn hóa hướng trục để luôn gập từ dưới lên trên (cho trục ngang) 
  // hoặc từ phải sang trái (cho trục dọc)
  // Nếu dx < 0 (trục hướng sang trái) hoặc (dx == 0 và dy < 0 - trục hướng lên trên)
  // thì đảo ngược vector trục.
  if (dx < 0 || (Math.abs(dx) < 0.01 && dy < 0)) {
    dx = -dx;
    dy = -dy;
  }

  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const axisAngle = angle - 90;

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {/* Ghost Layer - Shows the original position for comparison */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
        {item()}
      </div>

      {/* Lớp 1: Wrapper định hướng trục (Nghiêng axisAngle luôn cố định) */}
      <div 
        className="relative w-full h-full"
        style={{ 
          transform: `rotate(${axisAngle}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Layer Base: Nửa Phải (Đứng yên) */}
        <div 
          className="absolute inset-0 z-0"
          style={{ clipPath: 'inset(0 0 0 50%)' }}
        >
          {/* Layer bù trừ góc xoay */}
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ transform: `rotate(${-axisAngle}deg)` }}
          >
            {item()}
          </div>
        </div>

        {/* Layer Fold: Nửa Trái (Thực hiện lật 3D) */}
        <div 
          className="absolute inset-0 transition-all duration-[2500ms] linear"
          style={{ 
            clipPath: 'inset(0 50% 0 0)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'visible',
            transform: isFolded ? 'translateZ(2px) rotateY(180deg)' : 'translateZ(0px) rotateY(0deg)',
            zIndex: isFolded ? 10 : 1,
            opacity: 1 // Gập khít hoàn toàn, không để lộ mép nếu đối xứng
          }}
        >
          {/* Layer bù trừ góc xoay */}
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ transform: `rotate(${-axisAngle}deg)` }}
          >
            <div className="relative">
              {/* Mặt trước của phần gập */}
              <div style={{ backfaceVisibility: 'hidden' }}>
                {item()}
              </div>
              
              {/* Mặt sau của phần gập (Back side) - Phải là bản sao đối xứng của phần gập */}
              <div 
                className={`absolute inset-0 transition-opacity duration-[2500ms] linear pointer-events-none ${isFolded ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                  transform: 'rotateY(-180deg)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Lật ngược phần nội dung và căn chỉnh để phần gập (nửa trái) khớp chính xác */}
                  <div 
                    className="grayscale brightness-110 opacity-95" 
                    style={{ 
                      transform: 'scaleX(-1)', 
                      transformOrigin: '25% center',
                      filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.6))'
                    }}
                  >
                    {item()}
                  </div>
                </div>
              </div>

              {/* Mép giấy (Edge Highlight) - Chỉ hiện ở nếp gấp */}
              <div 
                className={`absolute inset-0 border-r-2 border-white/40 transition-all duration-[2500ms] linear ${isFolded ? 'opacity-100' : 'opacity-0'}`}
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
            </div>
            
            {/* Ambient Lighting */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transition-opacity duration-[2500ms] linear pointer-events-none ${isFolded ? 'opacity-20' : 'opacity-0'}`}
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        </div>

        {/* Trục đối xứng (Đường nét đứt màu đỏ) - Vẽ chính xác theo trục đã chọn */}
        {showAxis && (
          <svg 
            width="300" height="300" viewBox="0 0 300 300"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none z-20"
          >
            <motion.line
              x1="150" y1="-200" x2="150" y2="500"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="12,12"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
        )}
      </div>

      {/* Nếp gấp trung tâm (Crease) - Chỉ hiện khi đang gập hoặc đã gập */}
      {(isFolding || isFolded) && (
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/10 z-10 transform -translate-x-1/2 pointer-events-none" />
      )}
    </div>
  );
};

const SHAPES: Shape[] = [
  { 
    id: 'square', 
    name: 'Hình vuông', 
    category: 'plane', 
    axes: [
      { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
      { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: true },
      { id: 'd1', name: 'Đường chéo 1', x1: 75, y1: 75, x2: 225, y2: 225, isSymmetric: true },
      { id: 'd2', name: 'Đường chéo 2', x1: 225, y1: 75, x2: 75, y2: 225, isSymmetric: true }
    ],
    render: () => <rect x="75" y="75" width="150" height="150" fill="#10b981" stroke="rgba(0,0,0,0.5)" strokeWidth="3" rx="4" /> 
  },
  { 
    id: 'rect', 
    name: 'Hình chữ nhật', 
    category: 'plane', 
    axes: [
      { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
      { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: true },
      { id: 'd1', name: 'Đường chéo 1', x1: 50, y1: 75, x2: 250, y2: 225, isSymmetric: false },
      { id: 'd2', name: 'Đường chéo 2', x1: 250, y1: 75, x2: 50, y2: 225, isSymmetric: false }
    ],
    render: () => <rect x="50" y="75" width="200" height="150" fill="#3b82f6" stroke="rgba(0,0,0,0.5)" strokeWidth="3" rx="4" /> 
  },
  { 
    id: 'rhombus', 
    name: 'Hình thoi', 
    category: 'plane', 
    axes: [
      { id: 'd1', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
      { id: 'd2', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: true }
    ],
    render: () => <path d="M150 50 L250 150 L150 250 L50 150 Z" fill="#f59e0b" stroke="rgba(0,0,0,0.5)" strokeWidth="3" /> 
  },
  { 
    id: 'hexagon', 
    name: 'Hình lục giác đều', 
    category: 'plane', 
    axes: [
      { id: 'v1', name: 'Trục 1', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
      { id: 'h1', name: 'Trục 2', x1: 63.4, y1: 150, x2: 236.6, y2: 150, isSymmetric: true },
      { id: 'd1', name: 'Trục 3', x1: 63.4, y1: 100, x2: 236.6, y2: 200, isSymmetric: true },
      { id: 'd2', name: 'Trục 4', x1: 236.6, y1: 100, x2: 63.4, y2: 200, isSymmetric: true },
      { id: 'm1', name: 'Trục 5', x1: 193.3, y1: 75, x2: 106.7, y2: 225, isSymmetric: true },
      { id: 'm2', name: 'Trục 6', x1: 106.7, y1: 75, x2: 193.3, y2: 225, isSymmetric: true }
    ],
    render: () => <path d="M150 50 L236.6 100 L236.6 200 L150 250 L63.4 200 L63.4 100 Z" fill="#ec4899" stroke="rgba(0,0,0,0.5)" strokeWidth="3" /> 
  },
  { 
    id: 'triangle', 
    name: 'Tam giác đều', 
    category: 'plane', 
    axes: [
      { id: 'v1', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 200, isSymmetric: true },
      { id: 'v2', name: 'Trục chéo 1', x1: 236.6, y1: 200, x2: 106.7, y2: 125, isSymmetric: true },
      { id: 'v3', name: 'Trục chéo 2', x1: 63.4, y1: 200, x2: 193.3, y2: 125, isSymmetric: true }
    ],
    render: () => <path d="M150 50 L236.6 200 L63.4 200 Z" fill="#06b6d4" stroke="rgba(0,0,0,0.5)" strokeWidth="3" /> 
  },
  { 
    id: 'trapezoid', 
    name: 'Hình thang cân', 
    category: 'plane', 
    axes: [
      { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
      { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: false }
    ],
    render: () => <path d="M100 75 L200 75 L250 225 L50 225 Z" fill="#f97316" stroke="rgba(0,0,0,0.5)" strokeWidth="3" /> 
  },
  { 
    id: 'circle', 
    name: 'Hình tròn', 
    category: 'plane', 
    axes: [
      { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
      { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: true },
      { id: 'd1', name: 'Trục chéo 1', x1: 79, y1: 79, x2: 221, y2: 221, isSymmetric: true },
      { id: 'd2', name: 'Trục chéo 2', x1: 221, y1: 79, x2: 79, y2: 221, isSymmetric: true }
    ],
    render: () => <circle cx="150" cy="150" r="100" fill="#f43f5e" stroke="rgba(0,0,0,0.5)" strokeWidth="3" /> 
  },
  { 
    id: 'parallelogram', 
    name: 'Hình bình hành', 
    category: 'plane', 
    axes: [
      { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: false },
      { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: false },
      { id: 'd1', name: 'Đường chéo 1', x1: 80, y1: 75, x2: 220, y2: 225, isSymmetric: false },
      { id: 'd2', name: 'Đường chéo 2', x1: 250, y1: 75, x2: 50, y2: 225, isSymmetric: false }
    ], // No reflectional symmetry in general
    render: () => <path d="M80 75 L250 75 L220 225 L50 225 Z" fill="#8b5cf6" stroke="rgba(0,0,0,0.5)" strokeWidth="3" /> 
  },

  // Real Objects
  { id: 'flower4', name: 'Hoa 4 cánh', category: 'real', axes: [
    { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true }, 
    { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: true },
    { id: 'd1', name: 'Trục chéo 1', x1: 79, y1: 79, x2: 221, y2: 221, isSymmetric: true },
    { id: 'd2', name: 'Trục chéo 2', x1: 221, y1: 79, x2: 79, y2: 221, isSymmetric: true }
  ], render: () => (
    <g fill="#ec4899">
      {[0, 90, 180, 270].map(angle => (
        <ellipse key={angle} cx="150" cy="100" rx="25" ry="45" transform={`rotate(${angle}, 150, 150)`} />
      ))}
      <circle cx="150" cy="150" r="20" fill="#fbbf24" />
    </g>
  )},
  { id: 'traffic', name: 'Biển báo giao thông', category: 'real', axes: [
    { id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true },
    { id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: true }
  ], render: () => (
    <g>
      <circle cx="150" cy="150" r="100" fill="#ef4444" />
      <rect x="80" y="135" width="140" height="30" fill="#fff" />
    </g>
  )},
  { id: 'kite-real', name: 'Cánh diều', category: 'real', axes: [{ id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250 }], render: () => <path d="M150 50 L220 120 L150 250 L80 120 Z" fill="#3b82f6" /> },
  { id: 'house-real', name: 'Ngôi nhà', category: 'real', axes: [{ id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250 }], render: () => (
    <g>
      <rect x="75" y="150" width="150" height="100" fill="#3b82f6" />
      <path d="M75 150 L150 75 L225 150 Z" fill="#ef4444" />
      <rect x="130" y="180" width="40" height="70" fill="#fff" />
    </g>
  )},

  // Letters
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(char => {
    const axes: Axis[] = [];
    if (['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'].includes(char)) {
      axes.push({ id: 'v', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: true });
    }
    if (['B', 'C', 'D', 'E', 'H', 'I', 'K', 'O', 'X'].includes(char)) {
      axes.push({ id: 'h', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: char !== 'B' });
    }
    
    // Add non-symmetric axes for testing
    if (axes.length === 0) {
      axes.push({ id: 'v-none', name: 'Trục dọc', x1: 150, y1: 50, x2: 150, y2: 250, isSymmetric: false });
      axes.push({ id: 'h-none', name: 'Trục ngang', x1: 50, y1: 150, x2: 250, y2: 150, isSymmetric: false });
    }

    return {
      id: `letter-${char}`,
      name: `Chữ ${char}`,
      category: 'letter' as Category,
      axes: axes,
      render: () => (
        <text x="150" y="150" fontSize="150" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="#1e293b" fontFamily="Inter">
          {char}
        </text>
      )
    };
  })
];

export default function ReflectionalSimulation() {
  const [activeCategory, setActiveCategory] = useState<Category>('plane');
  const [selectedShape, setSelectedShape] = useState<Shape>(SHAPES[0]);
  const [activeAxis, setActiveAxis] = useState<Axis | null>(null);
  const [isFolding, setIsFolding] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isAxisDrawn, setIsAxisDrawn] = useState(false);
  const [showSymmetryCount, setShowSymmetryCount] = useState(false);

  const getSymmetryCount = (shape: Shape) => {
    if (shape.id === 'circle') return "vô số";
    return shape.axes.filter(a => a.isSymmetric !== false).length;
  };

  const handleDrawAxis = () => {
    if (activeAxis) {
      setIsAxisDrawn(true);
      setShowResult(false);
      setIsFolded(false);
    } else if (selectedShape.axes.length > 0) {
      // If no axis selected, pick the first one
      setActiveAxis(selectedShape.axes[0]);
      setIsAxisDrawn(true);
    }
  };

  const handleFold = () => {
    if (!activeAxis || !isAxisDrawn) return;
    setIsFolding(true);
    setIsFolded(false);
    setShowResult(false);
    setTimeout(() => {
      setIsFolding(false);
      setIsFolded(true);
      setShowResult(true);
    }, 2500);
  };

  const handleReset = () => {
    setIsFolding(false);
    setIsFolded(false);
    setShowResult(false);
    setActiveAxis(null);
    setIsAxisDrawn(false);
  };

  const getExtendedCoords = (axis: Axis) => {
    const dx = axis.x2 - axis.x1;
    const dy = axis.y2 - axis.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const extend = 40;
    const ux = dx / len;
    const uy = dy / len;
    return {
      x1: axis.x1 - ux * extend,
      y1: axis.y1 - uy * extend,
      x2: axis.x2 + ux * extend,
      y2: axis.y2 + uy * extend
    };
  };

  const filteredShapes = SHAPES.filter(s => s.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all">
          <ArrowLeft size={20} />
          Quay lại
        </Link>
        <h2 className="text-2xl font-black text-slate-800 font-sans uppercase">Mô phỏng hình có trục đối xứng</h2>
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
                    const first = SHAPES.find(s => s.category === cat.id)!;
                    setSelectedShape(first);
                    setActiveAxis(null);
                    setShowResult(false);
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
                    setActiveAxis(null);
                    setShowResult(false);
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
            <div className="mb-6 text-center relative">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedShape.name}</h3>
              <p className="text-slate-500 text-sm">Chọn trục và nhấn "Gập hình" để kiểm tra</p>
              
              <button 
                onClick={() => setShowSymmetryCount(true)}
                className="mt-3 mx-auto flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full font-bold text-xs transition-all border border-blue-100 shadow-sm"
              >
                <Hash size={14} />
                SỐ TRỤC ĐỐI XỨNG
              </button>

              <AnimatePresence>
                {showSymmetryCount && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border-2 border-blue-100 p-4 rounded-2xl shadow-2xl z-[60] text-center min-w-[240px]"
                  >
                    <button 
                      onClick={() => setShowSymmetryCount(false)} 
                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={16} />
                    </button>
                    <div className="pt-2">
                      <p className="text-slate-700 font-medium">
                        {selectedShape.name} có <span className="text-blue-600 font-bold text-lg">{getSymmetryCount(selectedShape)}</span> trục đối xứng.
                      </p>
                    </div>
                    <div className="mt-2 w-full h-1 bg-blue-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              className="relative w-[400px] h-[400px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden"
            >
              {(() => {
                if (!activeAxis) {
                  return (
                    <svg width="300" height="300" viewBox="0 0 300 300">
                      {selectedShape.render()}
                    </svg>
                  );
                }

                return (
                  <UniversalFold
                    axis={activeAxis}
                    isFolding={isFolding}
                    isFolded={isFolded}
                    showAxis={isAxisDrawn}
                    item={() => (
                      <svg width="300" height="300" viewBox="0 0 300 300">
                        {selectedShape.render()}
                      </svg>
                    )}
                  />
                );
              })()}

              {/* Interaction Layer: Axes Selection */}
              {!isFolding && !isFolded && (
                <svg 
                  width="300" 
                  height="300" 
                  viewBox="0 0 300 300" 
                  className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ zIndex: 40 }}
                >
                  {selectedShape.axes.map(axis => {
                    const ext = getExtendedCoords(axis);
                    const isActive = activeAxis?.id === axis.id;
                    // Hide the active axis line if it's already "Drawn" (being handled by UniversalFold)
                    if (isActive && isAxisDrawn) return null;
                    
                    return (
                      <line
                        key={axis.id}
                        x1={ext.x1} y1={ext.y1} x2={ext.x2} y2={ext.y2}
                        stroke={isActive ? (isAxisDrawn ? '#ef4444' : '#3b82f6') : '#94a3b8'}
                        strokeWidth={isActive ? 3 : 1}
                        strokeDasharray="10,8"
                        opacity={isActive ? 0.8 : 0.2}
                        className="cursor-pointer hover:stroke-blue-400 transition-all pointer-events-auto"
                        onClick={() => {
                          setActiveAxis(axis);
                          setIsAxisDrawn(false);
                          setShowResult(false);
                          setIsFolded(false);
                        }}
                      />
                    );
                  })}
                </svg>
              )}

              {/* Axis Labels */}
              {selectedShape.axes.map(axis => {
                const ext = getExtendedCoords(axis);
                const isActive = activeAxis?.id === axis.id;
                return (
                  <button
                    key={`btn-${axis.id}`}
                    onClick={() => {
                      setActiveAxis(axis);
                      setIsAxisDrawn(false);
                      setShowResult(false);
                      setIsFolded(false);
                    }}
                    className={`absolute px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md transition-all flex items-center gap-1.5 ${isActive ? (isAxisDrawn ? 'bg-red-500 text-white' : 'bg-blue-600 text-white') : 'bg-white text-slate-500 hover:text-slate-700'} scale-110 z-10 border-2 ${isActive ? 'border-white' : 'border-slate-100'}`}
                    style={{ 
                      left: `${ext.x1}px`, 
                      top: `${ext.y1}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <PencilLine size={12} />
                    <span className="uppercase whitespace-nowrap">{axis.name}</span>
                  </button>
                );
              })}
            </div>

            {showResult && activeAxis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 p-6 rounded-2xl border-2 text-center max-w-md shadow-lg transition-colors ${
                  (activeAxis.isSymmetric !== false) 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-rose-50 border-rose-100'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full text-white shadow-md ${
                    (activeAxis.isSymmetric !== false) ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {(activeAxis.isSymmetric !== false) ? <CheckCircle2 size={28} /> : <Info size={28} />}
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  (activeAxis.isSymmetric !== false) ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  {(activeAxis.isSymmetric !== false) ? 'Hình có trục đối xứng theo trục này' : 'Hình không có trục đối xứng theo trục này'}
                </h3>
                
                <p className={`font-medium ${
                  (activeAxis.isSymmetric !== false) ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {(activeAxis.isSymmetric !== false) 
                    ? `Khi gập hình qua ${activeAxis.name.toLowerCase()}, hai nửa của hình trùng khít hoàn toàn lên nhau.`
                    : `Khi gập hình qua ${activeAxis.name.toLowerCase()}, hai nửa của hình KHÔNG trùng khít lên nhau.`
                  }
                </p>
                
                <div className="mt-4 pt-4 border-t border-black/5 text-slate-500 text-sm italic">
                  {(activeAxis.isSymmetric !== false)
                    ? "Đường thẳng này chia hình thành hai phần đối xứng."
                    : "Đường thẳng này không chia hình thành hai phần đối xứng."
                  }
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={handleDrawAxis}
                disabled={isFolding || isFolded || isAxisDrawn}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 ${!isAxisDrawn && activeAxis ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}
              >
                <PencilLine size={20} />
                VẼ TRỤC
              </button>

              <button
                onClick={isFolded ? () => { setIsFolded(false); setShowResult(false); } : handleFold}
                disabled={isFolding || !isAxisDrawn}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 ${
                  isFolded 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }`}
              >
                <Scissors size={20} />
                {isFolded ? 'MỞ HÌNH' : 'GẬP HÌNH'}
              </button>

              {(activeAxis || showResult || isFolded || isAxisDrawn) && !isFolding && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all"
                >
                  ĐẶT LẠI
                </button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex gap-3">
              <Info className="text-blue-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Kiến thức cần nhớ</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Một hình được gọi là có trục đối xứng nếu có một đường thẳng d chia hình đó thành hai phần mà khi gập hình theo đường thẳng d thì hai phần đó chồng khít lên nhau. Đường thẳng d được gọi là trục đối xứng của hình.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
