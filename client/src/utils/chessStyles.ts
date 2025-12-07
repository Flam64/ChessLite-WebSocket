import type { Chess, Move } from "chess.js";

export type PossibleMovesMap = Record<
  string,
  {
    isCapture: boolean;
  }
>;

export function buildCustomSquareStyles(
  selectedSquare: string | null,
  possibleMoves: PossibleMovesMap,
  game: Chess,
  lastMove: Move | null,
  selectedMove: Move | null
): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};

  // 🎯 Case sélectionnée
  if (selectedSquare) {
    styles[selectedSquare] = {
      backgroundColor: "rgba(255, 255, 0, 0.4)",
    };
  }

  // 🎯 Coups possibles
  for (const [square, move] of Object.entries(possibleMoves)) {
    if (move.isCapture) {
      styles[square] = {
        ...(styles[square] ?? {}),
        boxShadow: "inset 0 0 0 2px rgba(239, 140, 2, 0.85)",
        borderRadius: "30%",
      };
    } else {
      styles[square] = {
        ...(styles[square] ?? {}),
        background: "radial-gradient(circle, rgba(239, 140, 2, 0.85) 10%, transparent 15%)",
      };
    }
  }

  // lighlight du dernier coup joué (plateau)

  // dernier coup joué
  if (lastMove) {
    styles[lastMove.from] = {
      ...(styles[lastMove.from] ?? {}),
      backgroundColor: "rgba(255, 255, 0, 0.5)",
    };
    styles[lastMove.to] = {
      ...(styles[lastMove.to] ?? {}),
      backgroundColor: "rgba(255, 255, 0, 0.5)",
    };
  }

  // coup sélectionné dans l’historique
  if (selectedMove) {
    styles[selectedMove.from] = {
      ...(styles[selectedMove.from] ?? {}),
      backgroundColor: "rgba(255, 255, 0, 0.5)",
    };
    styles[selectedMove.to] = {
      ...(styles[selectedMove.to] ?? {}),
      backgroundColor: "rgba(255, 255, 0, 0.5)",
    };
  }

  // 🎯 Roi en échec / mat
  if (game.isCheck()) {
    const kingSquare = findKingSquare(game);

    if (kingSquare) {
      const isMate = game.isCheckmate();

      styles[kingSquare] = {
        ...(styles[kingSquare] ?? {}),
        backgroundColor: isMate ? "rgba(180, 0, 0, 0.35)" : "rgba(255, 140, 0, 0.28)",
        boxShadow: isMate
          ? "0 0 20px 10px rgba(180,0,0,0.65), 0 0 12px rgba(180,0,0,0.8)"
          : "0 0 18px 8px rgba(255,140,0,0.55), 0 0 10px rgba(255,140,0,0.75)",
        borderRadius: "50%",
      };
    }
  }

  return styles;
}

/**
 * Trouve la case du roi dont c’est le tour
 */
export function findKingSquare(game: Chess): string | null {
  const board = game.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === "k" && piece.color === game.turn()) {
        const fileChar = "abcdefgh"[file];
        const rankChar = (8 - rank).toString();
        return `${fileChar}${rankChar}`;
      }
    }
  }
  return null;
}
