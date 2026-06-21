import React, { useRef, useState } from 'react';
import { Lock, Play, CheckCircle2, Map as MapIcon, ArrowRight, Award } from 'lucide-react';
import { Course } from '../../types';

interface CourseRoadmapProps {
  course: Course;
  completedLectures: string[]; // list of completed lecture titles
  onPlayLecture: (lecture: { title: string; videoId: string }) => void;
  darkMode: boolean;
  onBack: () => void;
}

export function CourseRoadmap({ course, completedLectures, onPlayLecture, darkMode, onBack }: CourseRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!containerRef.current) return;
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const drag = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  const lectures = course.lectures;

  // Dimensions
  const COLS = 4;
  const X_SPACING = 350;
  const Y_SPACING = 280;
  
  const mapWidth = COLS * X_SPACING + 200;
  const mapHeight = Math.ceil(lectures.length / COLS) * Y_SPACING + 400;

  const isLectureUnlocked = (index: number) => {
    if (index === 0) return true; // First lecture always unlocked
    // Unlocked if the previous lecture is completed
    const prevLecture = lectures[index - 1];
    return completedLectures.includes(prevLecture.title);
  };

  return (
    <div className={`relative w-full h-[75vh] min-h-[600px] overflow-hidden rounded-[2rem] border shadow-2xl ${darkMode ? 'bg-[#050b14] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      
      {/* Cool background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'linear-gradient(#4f46e5 1.5px, transparent 1.5px), linear-gradient(90deg, #4f46e5 1.5px, transparent 1.5px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back to Courses
        </button>
        <div className="pointer-events-none">
           <h2 className={`text-3xl font-extrabold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
             <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
               <MapIcon className="w-6 h-6" />
             </div>
             {course.title} Roadmap
           </h2>
           <p className={`text-sm mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
             Drag to explore. Complete lectures to unlock the next step.
           </p>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseDown={startDrag}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        onMouseMove={drag}
        className={`absolute inset-0 overflow-auto scrollbar-none flex items-center justify-center p-20 z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        
        {/* The 3D Canvas */}
        <div 
          className="relative transition-transform duration-1000"
          style={{
            transform: 'perspective(1800px) rotateX(55deg) rotateZ(-40deg)',
            transformStyle: 'preserve-3d',
            width: `${mapWidth}px`,
            height: `${mapHeight}px`
          }}
        >
          {/* Paths connecting nodes */}
          <svg className="absolute inset-0 pointer-events-none z-0" style={{ transform: 'translateZ(-2px)', width: '100%', height: '100%', overflow: 'visible' }}>
            {lectures.map((lec, i) => {
              if (i === lectures.length - 1) return null;
              
              const col1 = i % COLS;
              const row1 = Math.floor(i / COLS);
              const actualCol1 = row1 % 2 === 0 ? col1 : (COLS - 1) - col1;
              const x1 = actualCol1 * X_SPACING + 150 + 110; 
              const y1 = row1 * Y_SPACING + 150 + 80;

              const nextI = i + 1;
              const col2 = nextI % COLS;
              const row2 = Math.floor(nextI / COLS);
              const actualCol2 = row2 % 2 === 0 ? col2 : (COLS - 1) - col2;
              const x2 = actualCol2 * X_SPACING + 150 + 110;
              const y2 = row2 * Y_SPACING + 150 + 80;

              const isUnlockedLine = isLectureUnlocked(i) && isLectureUnlocked(nextI);

              return (
                <g key={`line-${i}`}>
                  <line 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke={isUnlockedLine ? '#3b82f6' : (darkMode ? '#1e293b' : '#cbd5e1')} 
                    strokeWidth="12" 
                    strokeDasharray={isUnlockedLine ? 'none' : '16 16'}
                    strokeLinecap="round"
                    className={isUnlockedLine ? 'drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}
                  />
                  {/* Arrow overlay for unlocked paths */}
                  {isUnlockedLine && (
                    <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="6" fill="#60a5fa" className="animate-pulse" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Lecture Nodes */}
          {lectures.map((lecture, index) => {
            const unlocked = isLectureUnlocked(index);
            const completed = completedLectures.includes(lecture.title);
            
            const col = index % COLS;
            const row = Math.floor(index / COLS);
            const actualCol = row % 2 === 0 ? col : (COLS - 1) - col;
            
            const x = actualCol * X_SPACING + 150;
            const y = row * Y_SPACING + 150;

            let topColor = darkMode ? 'bg-slate-800' : 'bg-white';
            let sideColor1 = darkMode ? 'bg-slate-900' : 'bg-slate-200';
            let sideColor2 = darkMode ? 'bg-slate-950' : 'bg-slate-300';
            let textColor = darkMode ? 'text-slate-200' : 'text-slate-700';

            if (completed) {
              topColor = 'bg-gradient-to-br from-emerald-400 to-emerald-600';
              sideColor1 = 'bg-emerald-700';
              sideColor2 = 'bg-emerald-800';
              textColor = 'text-white';
            } else if (unlocked) {
              topColor = 'bg-gradient-to-br from-blue-500 to-indigo-600';
              sideColor1 = 'bg-indigo-700';
              sideColor2 = 'bg-indigo-800';
              textColor = 'text-white';
            }

            return (
              <div 
                key={lecture.videoId + index}
                onClick={(e) => {
                  if (unlocked && !isDragging) {
                    onPlayLecture(lecture);
                  }
                }}
                className={`absolute group transition-all duration-500 hover:-translate-y-4 ${unlocked ? 'cursor-pointer hover:scale-[1.03]' : 'opacity-60 cursor-not-allowed'}`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translateZ(${unlocked ? '30px' : '0px'})`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Dynamic Drop Shadow */}
                <div className={`absolute w-[240px] h-[160px] rounded-3xl blur-xl ${unlocked ? 'bg-blue-500/40 translate-z-[-30px]' : 'bg-black/20 translate-z-0'} translate-y-6 translate-x-6 transition-all duration-500 group-hover:translate-z-[-40px] group-hover:blur-2xl`} />
                
                {/* Top Face */}
                <div className={`relative w-[240px] h-[160px] rounded-[2rem] ${topColor} border-2 ${unlocked && !completed ? 'border-white/20' : completed ? 'border-emerald-300/40' : darkMode ? 'border-slate-700' : 'border-slate-300'} shadow-2xl flex flex-col p-5 z-20 transition-all duration-500 overflow-hidden`}>
                  
                  {/* Subtle shine effect on top face */}
                  {unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  )}

                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${completed ? 'bg-white/20 text-white' : unlocked ? 'bg-white/20 text-white' : darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                      {completed ? <CheckCircle2 className="w-5 h-5" /> : unlocked ? <Play className="w-5 h-5 ml-0.5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-sm tracking-wide ${completed ? 'bg-white/20 text-white' : unlocked ? 'bg-white/20 text-white' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                      LEC {index + 1}
                    </span>
                  </div>

                  <h3 className={`font-bold text-[15px] leading-tight mt-auto relative z-10 ${textColor}`}>
                    {lecture.title}
                  </h3>

                  {/* Progress Bar inside block */}
                  {unlocked && !completed && (
                    <div className="mt-3 w-full h-2 rounded-full bg-black/20 shadow-inner relative z-10 overflow-hidden">
                      <div className="h-full rounded-full bg-white relative">
                        <div className="absolute inset-0 bg-white/50 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Left 3D Side */}
                <div 
                  className={`absolute top-full left-[10px] w-[220px] h-[30px] ${sideColor1} rounded-b-[1.5rem]`}
                  style={{
                    transformOrigin: 'top',
                    transform: 'rotateX(-90deg) translateZ(0px)',
                    zIndex: 15
                  }} 
                />
                
                {/* Right 3D Side */}
                <div 
                  className={`absolute top-[10px] left-full w-[30px] h-[140px] ${sideColor2} rounded-r-[1.5rem]`}
                  style={{
                    transformOrigin: 'left',
                    transform: 'rotateY(90deg) translateZ(0px)',
                    zIndex: 15
                  }} 
                />
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
