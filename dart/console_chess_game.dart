import 'package:test/test.dart';
import 'index.dart';

void main() {
  group('ChessBoard - Movement Validation', () {
    late ChessBoard board;

    setUp(() {
      board = ChessBoard();
    });

    test('Pawn movement: white forward one step', () {
      expect(
          board.isValidMove(board.board[6][0]!, [6, 0], [5, 0], true), isTrue);
    });

    test('Pawn movement: black forward one step', () {
      expect(
          board.isValidMove(board.board[1][0]!, [1, 0], [2, 0], true), isTrue);
    });

    test('Knight movement: initial valid L-shape', () {
      expect(
          board.isValidMove(board.board[7][1]!, [7, 1], [5, 2], true), isTrue);
    });

    test('Rook movement: blocked initially', () {
      expect(
          board.isValidMove(board.board[7][0]!, [7, 0], [5, 0], true), isFalse);
    });

    test('Bishop movement: blocked initially', () {
      expect(
          board.isValidMove(board.board[7][2]!, [7, 2], [5, 4], true), isFalse);
    });

    test('Queen movement: vertical with clear path', () {
      board.board[6][3] = null;
      board.board[5][3] = null;
      expect(
          board.isValidMove(board.board[7][3]!, [7, 3], [5, 3], true), isTrue);
    });

    test('King movement: 1 square in any direction', () {
      expect(
          board.isValidMove(board.board[7][4]!, [7, 4], [6, 4], true), isFalse);
      board.board[6][4] = null;
      expect(
          board.isValidMove(board.board[7][4]!, [7, 4], [6, 4], true), isTrue);
    });

    test('Queen movement: diagonal blocked', () {
      expect(
          board.isValidMove(board.board[7][3]!, [7, 3], [5, 5], true), isFalse);
    });

    test('Move to same color square should fail', () {
      expect(
          board.isValidMove(board.board[7][1]!, [7, 1], [6, 2], true), isFalse);
    });

    test('Capture opponent piece (Pawn)', () {
      board.board[4][4] = ChessPiece('P', 'W');
      board.board[3][5] = ChessPiece('P', 'B');
      expect(
          board.isValidMove(board.board[4][4]!, [4, 4], [3, 5], true), isTrue);
    });

    test('Out of bounds move should fail', () {
      expect(
          board.isValidMove(board.board[7][1]!, [7, 1], [8, 2], true), isFalse);
    });
  });

  group('ChessBoard - Move Piece Execution', () {
    late ChessBoard board;

    setUp(() {
      board = ChessBoard();
      board.board[6][4] = null;
      board.board[5][4] = null;
      board.board[7][4] = ChessPiece('K', 'W');
    });

    test('Should move king and win if captures opposing king', () {
      board.board[6][4] = ChessPiece('K', 'B');
      final result = board.movePiece([7, 4], [6, 4], true);
      expect(result, equals('win'));
    });

    test('Should throw error if no piece at start', () {
      expect(() => board.movePiece([4, 4], [5, 4], true),
          throwsA(isA<Exception>()));
    });

    test('Should throw error if illegal move', () {
      expect(() => board.movePiece([7, 4], [4, 4], true),
          throwsA(isA<Exception>()));
    });

    test('Pawn first move can move 2 squares forward (white)', () {
      final pawn = ChessPiece('P', 'W');
      board.board[6][4] = pawn;
      expect(board.isValidMove(pawn, [6, 4], [4, 4], true), isTrue);
    });

    test('Pawn first move can move 2 squares forward (black)', () {
      final pawn = ChessPiece('P', 'B');
      board.board[1][4] = pawn;
      expect(board.isValidMove(pawn, [1, 4], [3, 4], true), isTrue);
    });

    test('Pawn cannot move 2 squares after first move', () {
      final pawn = ChessPiece('P', 'W');
      board.board[6][3] = pawn;
      board.movePiece([6, 3], [5, 3], true);
      expect(board.isValidMove(pawn, [5, 3], [3, 3], false), isFalse);
    });

    test('White pawn promotion to Queen at last rank', () {
      final pawn = ChessPiece('P', 'W');
      board.board[1][0] = null;
      board.board[0][0] = null;
      board.board[1][0] = pawn;

      final result = board.movePiece([1, 0], [0, 0], true);
      final promotedPiece = board.board[0][0];

      expect(promotedPiece!.name, equals('Q'));
      expect(promotedPiece.color, equals('W'));
      expect(result, equals('ok'));
    });

    test('Black pawn promotion to Queen at last rank', () {
      final pawn = ChessPiece('P', 'B');
      board.board[6][0] = null;
      board.board[7][0] = null;
      board.board[6][0] = pawn;

      final result = board.movePiece([6, 0], [7, 0], false);
      final promotedPiece = board.board[7][0];

      expect(promotedPiece!.name, equals('Q'));
      expect(promotedPiece.color, equals('B'));
      expect(result, equals('ok'));
    });
  });
}
