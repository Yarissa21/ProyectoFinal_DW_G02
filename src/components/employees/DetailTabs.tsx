import type { KeyboardEvent } from 'react';

export interface DetailTab {
  id: string;
  label: string;
}

interface DetailTabsProps {
  idPrefix: string;
  label: string;
  tabs: DetailTab[];
  active: string;
  onChange: (id: string) => void;
}

function tabId(prefix: string, id: string): string {
  return `${prefix}-tab-${id}`;
}

function panelId(prefix: string, id: string): string {
  return `${prefix}-panel-${id}`;
}

function DetailTabs({ idPrefix, label, tabs, active, onChange }: DetailTabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === -1) return;
    event.preventDefault();
    onChange(tabs[next].id);
    document.getElementById(tabId(idPrefix, tabs[next].id))?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            id={tabId(idPrefix, tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(idPrefix, tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
              selected
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default DetailTabs;