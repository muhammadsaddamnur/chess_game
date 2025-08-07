import 'dart:io';

class ChessPiece {
  final String name; // 'P', 'Q', 'K', etc.
  final String color; // 'W' or 'B'

  ChessPiece(this.name, this.color);

  @override
  String toString() => '$color$name';
}

class ChessBoard {
  final List<List<ChessPiece?>> board = List.generate(
    8,
    (_) => List.filled(8, null),
  );

  ChessBoard() {
    initializeBoard();
  }

  void initializeBoard() {
    final layout = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    for (int i = 0; i < 8; i++) {
      board[1][i] = ChessPiece('P', 'B');
      board[6][i] = ChessPiece('P', 'W');
      board[0][i] = ChessPiece(layout[i], 'B');
      board[7][i] = ChessPiece(layout[i], 'W');
    }
  }

  void printBoard() {
    print('  a  b  c  d  e  f  g  h');
    for (int i = 0; i < 8; i++) {
      String row = '${8 - i} ';
      for (int j = 0; j < 8; j++) {
        final piece = board[i][j];
        row += (piece?.toString() ?? '. ') + ' ';
      }
      print('$row${8 - i}');
    }
    print('  a  b  c  d  e  f  g  h\n');
  }

  String movePiece(List<int> start, List<int> end, bool firstMove) {
    /// sr is the row number of the start position
    /// sc is the column number of the start position
    final sr = start[0], sc = start[1];

    /// er is the row number of the end position
    /// ec is the column number of the end position
    final er = end[0], ec = end[1];

    final piece = board[sr][sc];
    if (piece == null) throw Exception('No piece at start position.');
    if (!isValidMove(piece, [sr, sc], [er, ec], firstMove)) {
      throw Exception('Illegal move.');
    }

    final destPiece = board[er][ec];
    if (destPiece != null && destPiece.name == 'K') return 'win';

    board[er][ec] = piece;
    board[sr][sc] = null;

    // Promotion
    if (piece.name == 'P' && (er == 0 || er == 7)) {
      board[er][ec] = ChessPiece('Q', piece.color);
    }

    return 'ok';
  }

  bool isValidMove(
    ChessPiece piece,
    List<int> start,
    List<int> end,
    bool firstMove,
  ) {
    final sr = start[0], sc = start[1];
    final er = end[0], ec = end[1];
    if (er < 0 || er > 7 || ec < 0 || ec > 7) return false;

    final target = board[er][ec];
    if (target != null && target.color == piece.color) return false;

    final dr = er - sr;
    final dc = ec - sc;

    switch (piece.name) {
      case 'P':
        final dir = piece.color == 'W' ? -1 : 1;

        /// Allow pawn to move forward one space if no target
        if (dc == 0 && dr == dir && target == null) return true;

        /// Allow pawn to move forward two spaces on first move if path is clear
        if (firstMove &&
            dc == 0 &&
            dr == 2 * dir &&
            target == null &&
            board[sr + dir][sc] == null) {
          return true;
        }

        /// Allow pawn to capture diagonally
        if ((dc.abs() == 1) && dr == dir && target != null) return true;
        return false;

      case 'R':

        /// Check if moving horizontally
        if (sr == er) {
          final step = (ec - sc).sign;
          for (int c = sc + step; c != ec; c += step) {
            if (board[sr][c] != null) return false;
          }
          return true;
        }

        /// Check if moving vertically
        if (sc == ec) {
          final step = (er - sr).sign;
          for (int r = sr + step; r != er; r += step) {
            if (board[r][sc] != null) return false;
          }
          return true;
        }
        return false;

      case 'K':
        return dr.abs() <= 1 && dc.abs() <= 1;

      case 'N':
        return (dr.abs() == 1 && dc.abs() == 2) ||
            (dr.abs() == 2 && dc.abs() == 1);

      case 'B':

        /// Check if moving diagonally
        if (dr.abs() == dc.abs()) {
          final stepR = dr.sign;
          final stepC = dc.sign;
          for (int r = sr + stepR, c = sc + stepC;
              r != er;
              r += stepR, c += stepC) {
            if (board[r][c] != null) return false;
          }
          return true;
        }

        return false;

      case 'Q':

        /// The queen can move any number of squares along a rank, file, or diagonal
        if (sr == er || sc == ec || dr.abs() == dc.abs()) {
          final stepR = (er - sr).sign;
          final stepC = (ec - sc).sign;
          int r = sr + (sr != er ? stepR : 0);
          int c = sc + (sc != ec ? stepC : 0);
          while (r != er || c != ec) {
            if (board[r][c] != null) return false;
            r += (sr != er ? stepR : 0);
            c += (sc != ec ? stepC : 0);
          }
          return true;
        }
        return false;
    }

    return false;
  }
}

List<List<int>> parseInput(String input) {
  final parts = input.trim().split(' ');
  if (parts.length != 2) throw Exception('Invalid input format.');

  if (parts[0].contains(',')) {
    final start = parts[0].split(',').map(int.parse).toList();
    final end = parts[1].split(',').map(int.parse).toList();
    return [start, end];
  } else {
    final start = parts[0];
    final end = parts[1];
    final sc = start.codeUnitAt(0) - 'a'.codeUnitAt(0);
    final sr = 8 - int.parse(start[1]);
    final ec = end.codeUnitAt(0) - 'a'.codeUnitAt(0);
    final er = 8 - int.parse(end[1]);
    return [
      [sr, sc],
      [er, ec],
    ];
  }
}

Future<void> main() async {
  final board = ChessBoard();
  var turn = 'W';
  var firstMoveWhite = true;
  var firstMoveBlack = true;

  board.printBoard();

  while (true) {
    stdout.write("$turn's turn. Enter move (e.g. b2 b3 or 1,1 2,1): ");
    final input = stdin.readLineSync();
    if (input == null) continue;

    try {
      final parsed = parseInput(input);
      final start = parsed[0];
      final end = parsed[1];
      final piece = board.board[start[0]][start[1]];

      if (piece == null || piece.color != turn) {
        print("Invalid piece selection.");
        continue;
      }

      final result = board.movePiece(
        start,
        end,
        turn == 'W' ? firstMoveWhite : firstMoveBlack,
      );

      if (turn == 'W') {
        firstMoveWhite = false;
      } else {
        firstMoveBlack = false;
      }

      board.printBoard();

      if (result == 'win') {
        print('$turn wins by capturing the King!');
        break;
      }

      turn = turn == 'W' ? 'B' : 'W';
    } catch (e) {
      print('Error: ${e.toString()}');
    }
  }
}
