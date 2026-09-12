const steps = [
  { label: 'Giỏ hàng', icon: '🛒' },
  { label: 'Giao hàng', icon: '📦' },
  { label: 'Thanh toán', icon: '💳' },
  { label: 'Hoàn thành', icon: '✅' },
];

export default function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 0 28px',
      gap: 0,
    }}>
      {steps.map((s, index) => {
        const step = index + 1;
        const isDone = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              {/* Circle */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isDone ? '16px' : '14px',
                fontWeight: 800,
                background: isDone ? '#16a34a' : isCurrent ? '#2563eb' : '#f1f5f9',
                color: isDone || isCurrent ? '#fff' : '#94a3b8',
                border: isCurrent ? '3px solid #bfdbfe' : isDone ? '3px solid #bbf7d0' : '2px solid #e2e8f0',
                boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {isDone ? '✓' : step}
              </div>
              {/* Label */}
              <span style={{
                fontSize: '11px',
                fontWeight: isCurrent ? 700 : 500,
                color: isDone ? '#16a34a' : isCurrent ? '#2563eb' : '#94a3b8',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </div>

            {/* Connector line */}
            {step < steps.length && (
              <div style={{
                width: '80px',
                height: '2px',
                background: isDone ? '#16a34a' : '#e2e8f0',
                margin: '0 6px',
                marginBottom: '22px',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
