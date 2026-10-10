import React, { useState } from 'react';
import { SizeChart, SizeChartRow } from '../types';
import { ADULT_APPAREL_SIZE_CHART, convertRangeToCm, GIRLS_DRESS_SIZE_CHART } from '../utils/variants';
import { X, Ruler, Info, Check, Sparkles } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  categoryName?: string;
  customChart?: SizeChart;
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  productName,
  categoryName,
  customChart,
  selectedSize,
  onSelectSize,
}) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const safeProductName = String(productName || '');
  const safeCategoryName = String(categoryName || '');

  // Determine chart to display: customChart -> adult if product is women's/men's/adult -> girls if category contains 'girl' or 'kid' -> default adult apparel
  const isAdultApparel =
    safeProductName.toLowerCase().includes("women") ||
    safeProductName.toLowerCase().includes("woman") ||
    safeProductName.toLowerCase().includes("men") ||
    safeProductName.toLowerCase().includes("adult");

  const isGirlsOrKids =
    !isAdultApparel &&
    ((safeCategoryName && (safeCategoryName.toLowerCase().includes('girl') || safeCategoryName.toLowerCase().includes('kid'))) ||
      safeProductName.toLowerCase().includes('girl') ||
      safeProductName.toLowerCase().includes('kid'));

  const chart: SizeChart = customChart || (isGirlsOrKids ? GIRLS_DRESS_SIZE_CHART : ADULT_APPAREL_SIZE_CHART);

  if (!isOpen) return null;

  const rows: SizeChartRow[] = chart.rows || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-2xs">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                Size Guide & Measurements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {productName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setUnit('inches')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  unit === 'inches'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  unit === 'cm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                CM
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Chart Header Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                {chart.title || 'Official Size Chart'}
              </span>
            </div>
            <span className="font-mono text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider text-[11px]">
              Unit: {unit === 'inches' ? 'Inches (in)' : 'Centimeters (cm)'}
            </span>
          </div>

          {/* Measurements Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3 pl-4">Size</th>
                    {chart.type === 'girls' && <th className="p-3">Age Group</th>}
                    <th className="p-3">Bust / Chest</th>
                    <th className="p-3">Waist</th>
                    {chart.type !== 'girls' && <th className="p-3">Hips</th>}
                    <th className="p-3">Length</th>
                    {chart.type === 'girls' && <th className="p-3">Height</th>}
                    {chart.type !== 'girls' && <th className="p-3">Shoulder</th>}
                    <th className="p-3 pr-4 text-right">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row) => {
                    const isSelected = (selectedSize || '').toLowerCase() === row.size.toLowerCase();
                    return (
                      <tr
                        key={row.size}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/60 font-semibold'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3 pl-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {row.size}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          )}
                        </td>
                        {chart.type === 'girls' && (
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.age_group || '—'}</td>
                        )}
                        <td className="p-3 text-slate-700 dark:text-slate-300 tabular-nums">
                          {unit === 'inches' ? row.chest || '—' : convertRangeToCm(row.chest)}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 tabular-nums">
                          {unit === 'inches' ? row.waist || '—' : convertRangeToCm(row.waist)}
                        </td>
                        {chart.type !== 'girls' && (
                          <td className="p-3 text-slate-700 dark:text-slate-300 tabular-nums">
                            {unit === 'inches' ? row.hips || '—' : convertRangeToCm(row.hips)}
                          </td>
                        )}
                        <td className="p-3 text-slate-700 dark:text-slate-300 tabular-nums">
                          {unit === 'inches' ? row.length || '—' : convertRangeToCm(row.length)}
                        </td>
                        {chart.type === 'girls' && (
                          <td className="p-3 text-slate-700 dark:text-slate-300 tabular-nums">
                            {unit === 'inches' ? row.height || '—' : convertRangeToCm(row.height)}
                          </td>
                        )}
                        {chart.type !== 'girls' && (
                          <td className="p-3 text-slate-700 dark:text-slate-300 tabular-nums">
                            {unit === 'inches' ? row.shoulder || '—' : convertRangeToCm(row.shoulder)}
                          </td>
                        )}
                        <td className="p-3 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSize?.(row.size);
                              onClose();
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" /> Selected
                              </span>
                            ) : (
                              'Select'
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Measuring Guide Tips */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
              <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>How to Measure for Perfect Fit</span>
            </div>
            <ul className="text-xs text-amber-950/90 dark:text-amber-300/90 space-y-1.5 pl-5 list-disc leading-relaxed">
              {(chart.guide_tips && chart.guide_tips.length > 0
                ? chart.guide_tips
                : [
                    'Bust/Chest: Measure under arms around the fullest part of bust.',
                    'Waist: Measure around your natural waistline keeping tape comfortably loose.',
                    'Length: Measure from shoulder high point straight down to hemline.',
                    'In-between sizes? We recommend choosing the larger size for a relaxed comfortable fit.',
                  ]
              ).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Need sizing advice? Contact Zevora Support</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors border border-slate-800 dark:border-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
