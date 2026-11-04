import pixelIcons from './assets/statquest-pixels.svg?url&no-inline';

export default function PixelIcon({ name, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
      <use href={`${pixelIcons}#${name}`} />
    </svg>
  );
}
