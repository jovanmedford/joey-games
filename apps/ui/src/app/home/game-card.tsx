import { GameMeta } from '@prisma/client';
import { Button } from '@chakra-ui/react';

export default function GameCard({
  meta,
  className = '',
}: {
  meta: GameMeta;
  className?: string;
}) {
  return (
    <div
      className={`${className} bg-slate-600 py-10 px-8 rounded-lg text-white`}
    >
      <h2 className="text-3xl font-bold  mb-6">{meta.title}</h2>
      {meta.isPlayable ? (
        <Button className="mt-4">Play Game</Button>
      ) : (
        <span>Coming soon</span>
      )}
    </div>
  );
}
