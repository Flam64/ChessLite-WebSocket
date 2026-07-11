import { useMemo, useState } from "react";
import { Chess, Move } from "chess.js";

type ChessMove = ReturnType<InstanceType<typeof Chess>["move"]>;

export function useChessGame() {
  /** Historique complet des coups */
  const [moves, setMoves] = useState<ChessMove[]>([]);

  /** Index de lecture (0 = position initiale) */
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

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
   * Dernier coup joué (dérivé de l'état, pas besoin de state séparé)
   */
  const lastMove = useMemo(() => {
    return currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null;
  }, [moves, currentMoveIndex]);

  /**
   * Coup actuellement sélectionné
   */
  const selectedMove = useMemo(() => {
    return currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null;
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

    return true;
  };

  /**
   * Annuler le dernier coup
   */
  const undoLastMove = () => {
    if (moves.length === 0) return;

    const newMoves = moves.slice(0, -1);
    setMoves(newMoves);
    setCurrentMoveIndex(newMoves.length);
  };

  /** Navigation */
  const prevMove = () => setCurrentMoveIndex((i) => Math.max(0, i - 1));
  const nextMove = () => setCurrentMoveIndex((i) => Math.min(moves.length, i + 1));
  const goToStart = () => setCurrentMoveIndex(0);
  const goToEnd = () => setCurrentMoveIndex(moves.length);

  const goToMove = (moveIndex: number) => {
    setCurrentMoveIndex(Math.max(0, Math.min(moves.length, moveIndex)));
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
