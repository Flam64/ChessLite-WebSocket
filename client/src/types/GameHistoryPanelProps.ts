import { Chess, Move } from "chess.js";

export type GameHistoryPanelProps = {
  moves: ReturnType<Chess["move"]>[];
  currentMoveIndex: number;
  game: Chess;
  goToMove: (index: number) => void;
  nextMove: () => void;
  prevMove: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  undoLastMove: () => void;
  selectedMove: Move | null;
};
