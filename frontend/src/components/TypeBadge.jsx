import { TYPES } from '../lib/pokemon';

export default function TypeBadge({ type, size = 'md' }) {
  return (
    <span className={`type-badge type-badge--${size}`} style={{ '--tc': TYPES[type].color }}>
      {TYPES[type].name}
    </span>
  );
}
