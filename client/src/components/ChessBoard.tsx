import { useMemo, useCallback, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useChessGame } from "@//hooks/useChessGame";
import { Square, Move } from "chess.js";
import { buildCustomSquareStyles } from "@/utils/chessStyles";
import GameHistoryPanel from "./GameHistoryPanel";

export default function ChessBoard() {
  const {
    game,
    makeMove,
    moves,
    lastMove,
    currentMoveIndex,
    goToMove,
    nextMove,
    prevMove,
    goToStart,
    goToEnd,
    undoLastMove,
    selectedMove,
  } = useChessGame();

  type PossibleMove = {
    isCapture: boolean;
  };

  // const scrollRef = useRef<HTMLDivElement>(null);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, PossibleMove>>({});
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // déterminer les coups possibles lors du click sur un pièce
  const handleSquareClick = useCallback(
    (square: Square) => {
      const sq = square as Square;
      const piece = game.get(sq);

      // clique sur une case contenant la pièce du joueur -> sélection
      if (piece && piece.color === game.turn()) {
        if (sq === selectedSquare) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        const moves = game.moves({ square: sq, verbose: true }) as Move[];
        if (moves.length === 0) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        const nextPossibleMoves: Record<string, PossibleMove> = {};
        for (const m of moves) nextPossibleMoves[m.to] = { isCapture: !!m.captured };

        setSelectedSquare(sq);
        setPossibleMoves(nextPossibleMoves);
        return;
      }

      // Si on a déjà une sélection, tenter de jouer vers la case cliquée
      if (selectedSquare) {
        const from = selectedSquare as Square;
        const to = square as Square;

        // si clic en dehors de la selection des coups possibles, annuler la selection et l'affichage des coups possible pour cette pièce
        if (!possibleMoves[to]) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        // coup valide -> le mouvement de la pièce à lieu
        makeMove(from, to);

        // nettoyer l'UI (si ok ou non, on réinitialise la sélection)
        setSelectedSquare(null);
        setPossibleMoves({});
        return;
      }

      // clic sur case vide sans sélection -> rien
    },
    [game, selectedSquare, makeMove]
  );

  // style à appliquer aux pièces : surbrillance du dernier coup, pièces pouvant être capturées...
  const customSquareStyles = useMemo(() => {
    return buildCustomSquareStyles(selectedSquare, possibleMoves, game, lastMove, selectedMove);
  }, [selectedSquare, possibleMoves, game, lastMove, selectedMove]);

  // Déplacement d’une pièce
  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!targetSquare) return false;

      const piece = game.get(sourceSquare as Square);

      if (!piece || piece.color !== game.turn()) return false;

      setPossibleMoves({});
      setSelectedSquare(null);

      return makeMove(sourceSquare as Square, targetSquare as Square);
    },
    [game, makeMove]
  );

  return (
    <div className="flex justify-center items-start gap-6 p-6">
      <div className="w-[600px]">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handlePieceDrop}
          arePiecesDraggable={true}
          boardOrientation="white"
          customDarkSquareStyle={{ backgroundColor: "#779952" }}
          customLightSquareStyle={{ backgroundColor: "#edeed1" }}
          customSquareStyles={customSquareStyles}
          onSquareClick={handleSquareClick}
        />
      </div>
      <GameHistoryPanel
        moves={moves}
        currentMoveIndex={currentMoveIndex}
        game={game}
        goToMove={goToMove}
        nextMove={nextMove}
        prevMove={prevMove}
        goToStart={goToStart}
        goToEnd={goToEnd}
        undoLastMove={undoLastMove}
        selectedMove={selectedMove}
      />
    </div>
  );
}
