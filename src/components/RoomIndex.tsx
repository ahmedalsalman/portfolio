import { rooms, storeroom } from '@/lib/works';

/** The line under either hero: how much is on show, and a jump link to each room. */
export function RoomIndex() {
  const hung = rooms.reduce((n, r) => n + r.works.length, 0);
  return (
    <div className="now-showing">
      <span className="eyebrow">
        {hung} projects
        {storeroom.length ? ` · ${storeroom.length} experiments` : ''}
      </span>
      {rooms.map((r) => (
        <a key={r.id} href={`#room-${r.id}`}>
          {r.numeral}. {r.title}
        </a>
      ))}
    </div>
  );
}
