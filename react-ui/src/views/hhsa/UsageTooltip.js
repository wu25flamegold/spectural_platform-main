import React, { useState, useRef, useEffect } from 'react';

export default function UsageTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef();

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
    <div className="inline-block overflow-visible z-0">
      {/* ⬇️ 提示文字 + Icon 包在 capsule 裡 */}
      <div
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 cursor-pointer hover:bg-blue-100 transition"
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <svg
          className="w-4 h-4 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z" />
        </svg>
        <span className="font-medium">First-Time User Tips</span>
      </div>

      {/* ⬇️ Tooltip 本體 */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute left-0 mt-2 z-30 w-72 bg-white border border-gray-200 shadow-lg rounded-md p-3 text-xs text-gray-800 leading-relaxed"
        >
          <div className="flex justify-between items-start mb-1">
            <strong className="text-gray-600">💡 初次使用者導覽</strong>
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
          <div>
            我們準備了一組範例資料供你直接體驗：
            <ul className="list-disc list-inside ml-2 mt-1 mb-2">
              <li>年齡：30</li>
              <li>性別：Male</li>
              <li>時間區間：0~30秒</li>
              <li>通道：Channel 1（額葉）</li>
            </ul>
            <a
              href="/example-data/fa0019r0.edf"
              className="text-blue-500 hover:underline"
              download
            >
              📁 下載範例檔案 (.edf)
            </a>
            <p className="text-gray-500 text-[11px] mt-1">
              ⚠ 若瀏覽器跳出提示，請點選「保留」以完成安全下載。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
