import ChessBoard from "./components/ChessBoard";
import { useChessGame } from "./hooks/useChessGame";

function App() {
  const chess = useChessGame(); // ✅ instancié UNE SEULE FOIS

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ChessLite WebSocket</h1>
      <ChessBoard />
    </div>
  );
}

export default App;
