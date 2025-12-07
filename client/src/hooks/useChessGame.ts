import { useEffect, useMemo, useState } from "react";
import { Chess, Move } from "chess.js";

type ChessMove = ReturnType<InstanceType<typeof Chess>["move"]>;

export function useChessGame() {
  /** Historique complet des coups */
  const [moves, setMoves] = useState<ChessMove[]>([]);

  /** Index de lecture (0 = position initiale) */
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  /** Dernier coup joué (pour surlignage) */
  const [lastMove, setLastMove] = useState<Move | null>(null);

  /**
   * Partie reconstruite à partir de l'historique
   */
  const game = useMemo(() => {
    const chess = new Chess();

    for (let i = 0; i < currentMoveIndex; i++) {
      chess.move(moves[i]);
    }

    return chess;
  }, [moves, currentMoveIndex]);

  /**
   * Jouer un coup depuis le plateau
   */
  const makeMove = (from: string, to: string) => {
    const trimmedMoves = moves.slice(0, currentMoveIndex);

    const chess = new Chess();
    trimmedMoves.forEach((m) => chess.move(m));

    const move = chess.move({ from, to, promotion: "q" });
    if (!move) return false;

    setMoves([...trimmedMoves, move]);
    setCurrentMoveIndex(trimmedMoves.length + 1);
    setLastMove(move);

    return true;
  };

  // anuller le dernier coup
  const undoLastMove = () => {
    setMoves((prev) => {
      if (prev.length === 0) return prev;

      const newMoves = prev.slice(0, -1);

      setCurrentMoveIndex(newMoves.length);

      // mettre à jour lastMove
      if (newMoves.length > 0) {
        const m = newMoves[newMoves.length - 1];
        setLastMove(m);
      } else {
        setLastMove(null);
      }

      return newMoves;
    });
  };

  /** Navigation */

  useEffect(() => {
    if (currentMoveIndex > 0 && currentMoveIndex <= moves.length) {
      setLastMove(moves[currentMoveIndex - 1]);
    } else {
      setLastMove(null);
    }
  }, [currentMoveIndex, moves]);

  const prevMove = () => setCurrentMoveIndex((i) => Math.max(0, i - 1));
  const nextMove = () => setCurrentMoveIndex((i) => Math.min(moves.length, i + 1));
  const goToStart = () => setCurrentMoveIndex(0);
  const goToEnd = () => setCurrentMoveIndex(moves.length);
  const selectedMove = currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null;

  const goToMove = (moveIndex: number) => {
    setCurrentMoveIndex(Math.max(0, Math.min(moves.length, moveIndex)));

    // mettre à jour lastMove si on est à la fin
    if (moveIndex > 0 && moveIndex <= moves.length) {
      const m = moves[moveIndex - 1];
      setLastMove(m);
    } else {
      setLastMove(null);
    }
  };

  return {
    game,
    moves,
    currentMoveIndex,
    lastMove,
    makeMove,
    prevMove,
    nextMove,
    goToStart,
    goToEnd,
    goToMove,
    undoLastMove,
    selectedMove,
  };
}
