import { useAppStore } from '../../store/useAppStore';
import { planConfig } from '../../utils/plan-config';
import type { BusinessPlan } from '../../types';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function PlanSwitcher() {
  const { currentPlan, setPlan } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = planConfig[currentPlan];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const plans = Object.entries(planConfig) as [BusinessPlan, typeof current][];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-sm"
      >
        <span className="text-base">{current.icon}</span>
        <span className="font-medium text-surface-700 dark:text-surface-200 hidden sm:inline">
          {current.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] animate-scale-in z-50 overflow-hidden">
          <div className="p-2">
            {plans.map(([key, config]) => (
              <button
                key={key}
                onClick={() => { setPlan(key); setOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] text-left transition-colors ${
                  key === currentPlan
                    ? 'bg-primary-50 dark:bg-primary-950/40'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'
                }`}
              >
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${
                    key === currentPlan ? 'text-primary-700 dark:text-primary-400' : 'text-surface-800 dark:text-surface-200'
                  }`}>
                    {config.label}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{config.description}</p>
                </div>
                {key === currentPlan && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
