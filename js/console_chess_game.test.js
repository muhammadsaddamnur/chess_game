const { ChessBoard, ChessPiece } = require('./index.js');

describe('ChessBoard - Movement Validation', () => {
  let board;

  beforeEach(() => {
    board = new ChessBoard();
  });

  test('Pawn movement: white forward one step', () => {
    expect(board.isValidMove(board.board[6][0], [6, 0], [5, 0])).toBe(true);
  });

  test('Pawn movement: black forward one step', () => {
    expect(board.isValidMove(board.board[1][0], [1, 0], [2, 0])).toBe(true);
  });

  test('Knight movement: initial valid L-shape', () => {
    expect(board.isValidMove(board.board[7][1], [7, 1], [5, 2])).toBe(true); // White Knight
  });

  test('Rook movement: blocked initially', () => {
    expect(board.isValidMove(board.board[7][0], [7, 0], [5, 0])).toBe(false);
  });

  test('Bishop movement: blocked initially', () => {
    expect(board.isValidMove(board.board[7][2], [7, 2], [5, 4])).toBe(false);
  });

  test('Queen movement: vertical with clear path', () => {
    board.board[6][3] = null; // clear pawn
    board.board[5][3] = null; // clear path
    expect(board.isValidMove(board.board[7][3], [7, 3], [5, 3])).toBe(true); // white queen
  });

  test('King movement: 1 square in any direction', () => {
    expect(board.isValidMove(board.board[7][4], [7, 4], [6, 4])).toBe(false); // blocked by pawn
    board.board[6][4] = null;
    expect(board.isValidMove(board.board[7][4], [7, 4], [6, 4])).toBe(true);
  });

  test('Queen movement: diagonal blocked', () => {
    expect(board.isValidMove(board.board[7][3], [7, 3], [5, 5])).toBe(false);
  });

  test('Move to same color square should fail', () => {
    expect(board.isValidMove(board.board[7][1], [7, 1], [6, 2])).toBe(false); // Knight to white pawn
  });

  test('Capture opponent piece (Pawn)', () => {
    board.board[4][4] = new ChessPiece('P', 'W');
    board.board[3][5] = new ChessPiece('P', 'B');
    expect(board.isValidMove(board.board[4][4], [4, 4], [3, 5])).toBe(true);
  });

  test('Out of bounds move should fail', () => {
    expect(board.isValidMove(board.board[7][1], [7, 1], [8, 2])).toBe(false);
  });
});

describe('ChessBoard - Move Piece Execution', () => {
  let board;

  beforeEach(() => {
    board = new ChessBoard();
    board.board[6][4] = null; // clear pawn
    board.board[5][4] = null; // clear next tile
    board.board[7][4] = new ChessPiece('K', 'W'); // White King
  });

  test('Should move king and win if captures opposing king', () => {
    board.board[6][4] = new ChessPiece('K', 'B'); // Black King
    const result = board.movePiece([7, 4], [6, 4]);
    expect(result).toBe('win');
  });

  test('Should throw error if no piece at start', () => {
    expect(() => board.movePiece([4, 4], [5, 4])).toThrow("No piece at start position.");
  });

  test('Should throw error if illegal move', () => {
    expect(() => board.movePiece([7, 4], [4, 4])).toThrow("Illegal move.");
  });

  test('Pawn first move can move 2 squares forward (white)', () => {
    const pawn = new ChessPiece('P', 'W');
    board.board[6][4] = pawn;
    const whitePawn = board.board[6][4]; // e2
    expect(board.isValidMove(whitePawn, [6, 4], [4, 4], true)).toBe(true);
  });

  test('Pawn first move can move 2 squares forward (black)', () => {
    const pawn = new ChessPiece('P', 'B');
    board.board[6][4] = pawn;
    const blackPawn = board.board[1][4]; // e7
    expect(board.isValidMove(blackPawn, [1, 4], [3, 4], true)).toBe(true);
  });

  test('Pawn cannot move 2 squares after first move', () => {
    const pawn = new ChessPiece('P', 'W');
    board.board[6][3] = pawn;
    const whitePawn = board.board[6][3]; // d2

    board.movePiece([6, 3], [5, 3], true); // move to d3
    expect(board.isValidMove(pawn, [5, 3], [3, 3], false)).toBe(false); // attempt 2 squares from d3 to d5
  });

  test('White pawn promotion to Queen at last rank', () => {
    const pawn = new ChessPiece('P', 'W');
    board.board[1][0] = null; // clear b7
    board.board[0][0] = null; // clear b8
    board.board[1][0] = pawn;

    // move from b7 to b8 (promotion)
    const result = board.movePiece([1, 0], [0, 0], true);
    const promotedPiece = board.board[0][0];

    expect(promotedPiece.name).toBe('Q');
    expect(promotedPiece.color).toBe('W');
    expect(result).toBe('ok');
  });

  test('Black pawn promotion to Queen at last rank', () => {
    const pawn = new ChessPiece('P', 'B');
    board.board[6][0] = null; // clear a2
    board.board[7][0] = null; // clear a1
    board.board[6][0] = pawn;

    // move from a2 to a1 (promotion)
    const result = board.movePiece([6, 0], [7, 0], false);
    const promotedPiece = board.board[7][0];

    expect(promotedPiece.name).toBe('Q');
    expect(promotedPiece.color).toBe('B');
    expect(result).toBe('ok');
  });
});
