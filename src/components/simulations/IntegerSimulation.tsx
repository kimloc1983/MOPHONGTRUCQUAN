import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IntegerSimulation() {
  const [expression, setExpression] = useState('');
  const [steps, setSteps] = useState<{ value: number; color: string; start: number; end: number }[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [runnerPos, setRunnerPos] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState('Nhập phép tính (ví dụ: -2 + 3)');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parseExpression = (expr: string) => {
    // Basic parser for expressions like "-2 + 3" or "5 + (-4)"
    const cleanExpr = expr.replace(/\s+/g, '').replace(/\((-\d+)\)/g, '$1');
    const parts = cleanExpr.split('+');
    if (parts.length !== 2) return null;
    
    const num1 = parseInt(parts[0]);
    const num2 = parseInt(parts[1]);
    
    if (isNaN(num1) || isNaN(num2)) return null;
    return [num1, num2];
  };

  const handleRun = async () => {
    const nums = parseExpression(expression);
    if (!nums) {
      setMessage('Phép tính không hợp lệ! Hãy nhập dạng: a + b');
      return;
    }

    setIsRunning(true);
    setSteps([]);
    setCurrentStepIdx(-1);
    setRunnerPos(0);
    setResult(null);
    setMessage('Bắt đầu thực hiện...');

    const [a, b] = nums;
    const newSteps = [
      { value: a, color: a >= 0 ? '#3b82f6' : '#ef4444', start: 0, end: a },
      { value: b, color: b >= 0 ? '#3b82f6' : '#ef4444', start: a, end: a + b }
    ];
    setSteps(newSteps);

    // Animation helper
    const animateRunner = (from: number, to: number, duration: number) => {
      return new Promise<void>((resolve) => {
        const startTimestamp = performance.now();
        const step = (timestamp: number) => {
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          setRunnerPos(from + (to - from) * progress);
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        window.requestAnimationFrame(step);
      });
    };

    // Step 1
    setCurrentStepIdx(0);
    setMessage(`Di chuyển ${Math.abs(a)} đơn vị theo chiều ${a >= 0 ? 'dương' : 'âm'}`);
    await animateRunner(0, a, 2000); // 2 seconds for movement
    await new Promise(r => setTimeout(r, 3000)); // Total 5s including movement

    // Step 2
    setCurrentStepIdx(1);
    setMessage(`Tiếp tục di chuyển ${Math.abs(b)} đơn vị theo chiều ${b >= 0 ? 'dương' : 'âm'}`);
    await animateRunner(a, a + b, 2000);
    await new Promise(r => setTimeout(r, 3000));

    setResult(a + b);
    setMessage(`Hoàn thành! Kết quả: ${expression} = ${a + b}`);
    setIsRunning(false);
  };

  const reset = () => {
    setExpression('');
    setSteps([]);
    setCurrentStepIdx(-1);
    setRunnerPos(0);
    setResult(null);
    setIsRunning(false);
    setMessage('Nhập phép tính (ví dụ: -2 + 3)');
  };

  // Draw Number Line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2 + 50;
    const scale = 30; // pixels per unit
    const originX = width / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw main axis
    ctx.beginPath();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.moveTo(50, centerY);
    ctx.lineTo(width - 50, centerY);
    ctx.stroke();

    // Draw ticks and numbers
    ctx.textAlign = 'center';
    ctx.font = '12px Inter';
    for (let i = -15; i <= 15; i++) {
      const x = originX + i * scale;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 5);
      ctx.lineTo(x, centerY + 5);
      ctx.stroke();
      ctx.fillStyle = i === 0 ? '#000' : '#64748b';
      ctx.fillText(i.toString(), x, centerY + 20);
    }

    // Draw arrows for steps
    steps.forEach((step, idx) => {
      if (idx > currentStepIdx) return;
      
      const startX = originX + step.start * scale;
      // If it's the current step, draw up to runnerPos. Otherwise draw full step.
      const currentEndX = idx === currentStepIdx ? originX + runnerPos * scale : originX + step.end * scale;
      const y = centerY - 40 - (idx * 30); 

      ctx.beginPath();
      ctx.strokeStyle = step.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.moveTo(startX, y);
      ctx.lineTo(currentEndX, y);
      ctx.stroke();

      // Arrow head at currentEndX
      const headlen = 10;
      const angle = Math.atan2(0, currentEndX - startX);
      ctx.beginPath();
      ctx.moveTo(currentEndX, y);
      ctx.lineTo(currentEndX - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(currentEndX, y);
      ctx.lineTo(currentEndX - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();

      // Value label (only show if step is finished or significant progress)
      if (idx < currentStepIdx || (idx === currentStepIdx && Math.abs(runnerPos - step.start) > 0.5)) {
        ctx.fillStyle = step.color;
        ctx.font = 'bold 14px Inter';
        ctx.fillText(step.value > 0 ? `+${step.value}` : step.value.toString(), (startX + currentEndX) / 2, y - 10);
      }
      
      // Projection lines at currentEndX
      ctx.beginPath();
      ctx.strokeStyle = step.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(currentEndX, y);
      ctx.lineTo(currentEndX, centerY);
      ctx.stroke();
    });

    // Draw Runner
    const runnerX = originX + runnerPos * scale;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(runnerX, centerY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    // Simple stick figure
    ctx.beginPath();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.moveTo(runnerX, centerY - 10);
    ctx.lineTo(runnerX, centerY - 25);
    ctx.stroke();

  }, [steps, currentStepIdx, runnerPos]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all">
          <ArrowLeft size={20} />
          Quay lại
        </Link>
        <h2 className="text-2xl font-black text-slate-800 font-sans">MÔ PHỎNG CỘNG SỐ NGUYÊN</h2>
        <div className="w-24"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
          <div className="flex-grow">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nhập phép tính cộng</label>
            <input
              type="text"
              value={result !== null ? `${expression} = ${result}` : expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Ví dụ: (-2) + 3"
              disabled={isRunning}
              className={`w-full px-6 py-4 text-xl font-mono rounded-2xl border-2 outline-none transition-all ${result !== null ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-100 focus:border-blue-500'}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || !expression}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
            >
              <Play size={20} fill="currentColor" />
              THỰC HIỆN
            </button>
            <button
              onClick={reset}
              className="p-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl transition-all"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center gap-3 text-slate-600">
          <Info size={20} className="text-blue-500" />
          <p className="font-medium">{message}</p>
        </div>

        <div className="relative overflow-x-auto bg-white rounded-2xl border border-slate-100 p-4">
          <canvas
            ref={canvasRef}
            width={1000}
            height={400}
            className="mx-auto"
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h4 className="text-blue-800 font-bold mb-2">Quy tắc 1</h4>
            <p className="text-blue-700 text-sm">Muốn cộng hai số nguyên âm, ta cộng phần số tự nhiên của chúng với nhau rồi đặt dấu "-" trước kết quả.</p>
          </div>
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-amber-800 font-bold mb-2">Quy tắc 2</h4>
            <p className="text-amber-700 text-sm">
              1. Hai số nguyên đối nhau thì có tổng bằng 0.<br />
              2. Muốn cộng hai số nguyên khác dấu (không đối nhau), ta tìm hiệu hai phần số tự nhiên của chúng (số lớn trừ số nhỏ) rồi đặt trước hiệu tìm được dấu của số có phần số tự nhiên lớn hơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
