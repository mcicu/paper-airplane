import GameCanvas from "../components/GameCanvas";

function Home() {
  return (
      <div className="h-screen bg-gradient-to-b from-blue-400 to-green-400">
        <h1 className="text-center text-4xl font-bold text-white my-4">
          Flappy Bird Clone
        </h1>
        <GameCanvas />
      </div>
  );
}

export default Home;