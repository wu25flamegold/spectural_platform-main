import React, { useState, useRef, useEffect } from 'react';

export default function ROITooltip() {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef();

  const plotlyToolbarItems = [
    {
      label: 'Pan',
      desc: '拖曳平移視圖',
      svg: (
        <svg viewBox="0 0 1000 1000" className="w-4 h-4" fill="currentColor">
          <path d="m1000 350l-187 188 0-125-250 0 0 250 125 0-188 187-187-187 125 0 0-250-250 0 0 125-188-188 186-187 0 125 252 0 0-250-125 0 187-188 188 188-125 0 0 250 250 0 0-126 187 188z" transform="matrix(1 0 0 -1 0 850)" />
        </svg>
      )
    },
    {
      label: 'Clean Select',
      desc: '清除 ROI 框選',
      svg: (
        <svg viewBox="0 0 22 22" className="w-4 h-4" fill="currentColor">
          <path d="M21 20C21 20.55 20.55 21 20 21H19V19H21V20M15 21V19H17V21H15M11 21V19H13V21H11M7 21V19H9V21H7M4 21C3.45 21 3 20.55 3 20V19H5V21H4M3 15H5V17H3V15M21 15V17H19V15H21M14.59 8L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41L14.59 8M3 11H5V13H3V11M21 11V13H19V11H21M3 7H5V9H3V7M21 7V9H19V7H21M4 3H5V5H3V4C3 3.45 3.45 3 4 3M20 3C20.55 3 21 3.45 21 4V5H19V3H20M15 5V3H17V5H15M11 5V3H13V5H11M7 5V3H9V5H7Z" transform="translate(-3, -2.5) scale(1.2)" />
        </svg>
      )
    },
    {
      label: 'Box Select',
      desc: '框選 ROI ',
      svg: (
        <svg viewBox="0 0 1000 1000" className="w-4 h-4" fill="currentColor">
          <path d="m0 850l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z m285 0l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z m-857-286l0-143 143 0 0 143-143 0z m857 0l0-143 143 0 0 143-143 0z m-857-285l0-143 143 0 0 143-143 0z m857 0l0-143 143 0 0 143-143 0z m-857-286l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z m285 0l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z" transform="matrix(1 0 0 -1 0 850)" />
        </svg>
      )
    },
    {
      label: 'Zoom In',
      desc: '視圖放大',
      svg: (
        <svg viewBox="0 0 875 1000" className="w-4 h-4" fill="currentColor">
          <path d="m1 787l0-875 875 0 0 875-875 0z m687-500l-187 0 0-187-125 0 0 187-188 0 0 125 188 0 0 187 125 0 0-187 187 0 0-125z" transform="matrix(1 0 0 -1 0 850)" />
        </svg>
      )
    },
    {
      label: 'Zoom Out',
      desc: '視圖縮小',
      svg: (
        <svg viewBox="0 0 875 1000" className="w-4 h-4" fill="currentColor">
          <path d="m0 788l0-876 875 0 0 876-875 0z m688-500l-500 0 0 125 500 0 0-125z" transform="matrix(1 0 0 -1 0 850)" />
        </svg>
      )
    },
    {
      label: 'Reset Axes',
      desc: '重置視圖',
      svg: (
        <svg viewBox="0 0 1000 1000" className="w-4 h-4" fill="currentColor">
          <path d="m250 850l-187 0-63 0 0-62 0-188 63 0 0 188 187 0 0 62z m688 0l-188 0 0-62 188 0 0-188 62 0 0 188 0 62-62 0z m-875-938l0 188-63 0 0-188 0-62 63 0 187 0 0 62-187 0z m875 188l0-188-188 0 0-62 188 0 62 0 0 62 0 188-62 0z m-125 188l-1 0-93-94-156 156 156 156 92-93 2 0 0 250-250 0 0-2 93-92-156-156-156 156 94 92 0 2-250 0 0-250 0 0 93 93 157-156-157-156-93 94 0 0 0-250 250 0 0 0-94 93 156 157 156-157-93-93 0 0 250 0 0 250z" transform="matrix(1 0 0 -1 0 850)" />
        </svg>
      )
    },
    {
      label: 'Download',
      desc: '將視圖儲存為 PNG',
      svg: (
        <svg viewBox="0 0 1000 1000" className="w-4 h-4" fill="currentColor">
          <path d="m500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 15-23 28-40 28h-340c-16 0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 380c-19 0-35 16-35 35 0 19 16 35 35 35 19 0 35-16 35-35 0-19-16-35-35-35z" transform="matrix(1 0 0 -1 0 850)" />
        </svg>
      )
    }
  ];
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      {/* Capsule button */}
      <div
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 cursor-pointer hover:bg-blue-100 transition"
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z" />
        </svg>
        <span className="font-medium">First-Time User Tips</span>
      </div>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute left-0 mt-2 z-30 w-72 bg-white border border-gray-200 shadow-lg rounded-md p-3 text-xs text-gray-800 leading-relaxed"
        >
          {/* Title and Close Button */}
          <div className="flex justify-between items-center mb-2">
            <strong className="text-gray-700">📍 如何互動與分析 HHSA 圖？</strong>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Explanation */}
          <div className="mb-4 space-y-1">
            <div>
              你可以在圖上框選 ROI（感興趣區域），聚焦在特定頻率範圍，
              平台會自動分析該區域中<strong className="text-blue-600">能量最強的調變頻率與振幅</strong>，
              也就是<strong className="text-blue-600">最顯著的神經活動</strong>。
            </div>
          </div>

          {/* Toolbar */}
          <div className="font-semibold text-gray-700 mb-2">🛠️ 工具列說明（由左至右）</div>
          <div className="grid grid-cols-1 gap-y-2 text-xs text-gray-600">
            {plotlyToolbarItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-1">
                <div className="flex items-center gap-2">
                  {item.svg}
                  <span className="text-gray-500">{item.label}</span>
                </div>
                <span className="text-gray-600">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
