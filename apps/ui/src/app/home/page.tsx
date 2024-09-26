'use client';
import Logout from 'apps/ui/icons/logout';
import GameCard from './game-card';
import gameData from './games.json';
import { useLogout, useStatus } from '../hooks/queries';

export default function Index() {
  let mainTitle = gameData[0];
  let games = gameData.slice(1);

  const { status, data: user, isError: statusError } = useStatus();
  const logoutMutation = useLogout();

  if (statusError) {
    logoutMutation.mutate();
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="mx-4 my-8 xl:w-10/12 xl:mx-auto">
      <header className="flex justify-between">
        {status === 'success' ? (
          <span className="font-bold">{user.username}</span>
        ) : null}

        <Logout handleLogout={handleLogout} />
      </header>
      <main>
        <h1 className="text-center mb-8 uppercase">joey games</h1>
        <section className="lg:grid lg:grid-cols-12 lg: gap-4">
          <div className="col-start-1 col-end-10">
            <GameCard className="mb-4" meta={mainTitle} />
            <section className="grid md:grid-cols-2 gap-4 ">
              {games.map((meta) => (
                <GameCard meta={meta}></GameCard>
              ))}
            </section>
          </div>
          <Lobby />
        </section>
      </main>
    </div>
  );
}
