import { Link, useRouteError } from 'react-router-dom';
import { Pokeball } from './Icons';

export function RouteError() {
  const error = useRouteError();
  return (
    <div className="fatal">
      <Pokeball size={56} />
      <p>Não foi possível carregar os dados.</p>
      <p className="muted small">{error?.message}</p>
      <Link to="/" className="pill-btn" reloadDocument>Tentar de novo</Link>
    </div>
  );
}

export const DetailSkeleton = () => (
  <div className="detail detail--loading" aria-busy="true">
    <div className="skeleton skeleton--hero" />
    <div className="skeleton skeleton--line" />
    <div className="skeleton skeleton--block" />
  </div>
);

export const BootScreen = () => (
  <div className="boot">
    <Pokeball size={64} className="boot__ball" />
  </div>
);
