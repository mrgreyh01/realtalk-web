import { passwordScore } from '@/lib/format';

const COLORS = ['#e2e6ee', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'];
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function PasswordStrength({ password }) {
  const score = passwordScore(password);

  return (
    <div className="mb-5">
      <div className="mb-[7px] flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className="h-[5px] flex-1 rounded-full transition-colors duration-300"
            style={{ background: score >= step ? COLORS[score] : 'var(--c-input)' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="text-muted">Password strength</span>
        <span
          className="font-bold transition-colors duration-300"
          style={{ color: score ? COLORS[score] : 'var(--c-muted)' }}
        >
          {LABELS[score] || '\u00a0'}
        </span>
      </div>
    </div>
  );
}
