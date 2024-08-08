import GameCard from './game-card';
import gameData from './games.json';

export default function Index() {
  let mainTitle = gameData[0];
  let games = gameData.slice(1);
  return (
    <div className="mx-4 my-4 xl:w-10/12 xl:mx-auto">
      <header>
        <span className="font-bold">joey123</span>
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
          <div className="hidden lg:block col-start-10 col-end-13 border-slate-300 border-2 rounded-md">
            <header className='py-2 px-4 border-b-2'>
              <h2>Lobby</h2>
            </header>
            <div className='pt-4 px-4'>
              <p className='border-slate-300 text-center'>Empty</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
