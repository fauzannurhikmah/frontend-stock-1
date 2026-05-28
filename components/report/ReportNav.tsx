type ReportTab = {
  id: string;
  label: string;
  accent?: boolean;
};

export function ReportNav({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (next: string) => void;
  tabs: ReportTab[];
}) {
  return (
    <div className="rpt-nav">
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            className={`rpt-ntab ${isActive ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
            style={
              tab.accent && !isActive
                ? { color: "var(--grove)", fontWeight: 500 }
                : undefined
            }
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
