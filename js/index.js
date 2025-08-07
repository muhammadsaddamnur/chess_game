const readline = require('readline');

class ChessPiece {
  constructor(name, color) {
    this.name = name; // 'P', 'Q', 'K', etc.
    this.color = color; // 'W' or 'B'
  }

  toString() {
    return this.color + this.name;
  }
}

class ChessBoard {
  constructor() {
    this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.initializeBoard();
  }

  initializeBoard() {
    const layout = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

    for (let i = 0; i < 8; i++) {
      this.board[1][i] = new ChessPiece('P', 'B');
      this.board[6][i] = new ChessPiece('P', 'W');
      this.board[0][i] = new ChessPiece(layout[i], 'B');
      this.board[7][i] = new ChessPiece(layout[i], 'W');
    }
  }

  printBoard() {
    console.log("  a  b  c  d  e  f  g  h");
    for (let i = 0; i < 8; i++) {
      let row = `${8 - i} `;
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        row += piece ? piece.toString() : ". ";
        row += " ";
      }
      console.log(row + `${8 - i}`);
    }
    console.log("  a  b  c  d  e  f  g  h\n");
  }

  movePiece(start, end, firstMove) {
    /// sr is the row number of the start position
    /// sc is the column number of the start position
    const [sr, sc] = start;
    /// er is the row number of the end position
    /// ec is the column number of the end position
    const [er, ec] = end;
    const piece = this.board[sr][sc];

    if (!piece) throw new Error("No piece at start position.");
    if (!this.isValidMove(piece, start, end, firstMove)) throw new Error("Illegal move.");

    const destPiece = this.board[er][ec];
    if (destPiece && destPiece.name === 'K') return 'win';

    this.board[er][ec] = piece;
    this.board[sr][sc] = null;

    /// promotion is the process of changing a pawn into a queen when it reaches the other end of the board
    if (piece.name === 'P' && (er === 0 || er === 7)) {
      this.board[er][ec] = new ChessPiece('Q', piece.color);
    }
    
    return 'ok';
  }

  isValidMove(piece, [sr, sc], [er, ec], firstMove) {
    if (er < 0 || er > 7 || ec < 0 || ec > 7) return false;
    const target = this.board[er][ec];
    if (target && target.color === piece.color) return false;

    /// dr is the difference in row number between the start and end position
    /// dc is the difference in column number between the start and end positions
    const dr = er - sr;
    const dc = ec - sc;

    switch (piece.name) {
      case 'P': {
        const dir = piece.color === 'W' ? -1 : 1;
        // Allow pawn to move forward one space if no target
        if (dc === 0 && dr === dir && !target) return true;
        // Allow pawn to move forward two spaces on first move if path is clear
        if (firstMove && dc === 0 && dr === 2 * dir && !target && !this.board[sr + dir][sc]) return true;
        // Allow pawn to capture diagonally
        if (Math.abs(dc) === 1 && dr === dir && target) return true;
        return false;
      }
      case 'R': {
        // Check if moving horizontally
        if (sr === er) {
          const step = Math.sign(ec - sc);
          for (let c = sc + step; c !== ec; c += step) {
            if (this.board[sr][c]) return false;
          }
          return true;
        }
        // Check if moving vertically
        if (sc === ec) {
          const step = Math.sign(er - sr);
          for (let r = sr + step; r !== er; r += step) {
            if (this.board[r][sc]) return false;
          }
          return true;
        }
        return false;
      }
      case 'K': {
        return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
      }
      case 'N': return (Math.abs(dr) === 1 && Math.abs(dc) === 2) || (Math.abs(dr) === 2 && Math.abs(dc) === 1);
      case 'B': {
        // Check if moving diagonally
        if (Math.abs(dr) === Math.abs(dc)) {
          const stepR = Math.sign(er - sr);
          const stepC = Math.sign(ec - sc);
          for (let r = sr + stepR, c = sc + stepC; r !== er; r += stepR, c += stepC) {
            if (this.board[r][c]) return false;
          }
          return true;
        }
        
        return Math.abs(dr) === Math.abs(dc);
      }
      case 'Q': {
        // Check if moving horizontally
        if (sr === er) {
          const step = Math.sign(ec - sc);
          for (let c = sc + step; c !== ec; c += step) {
            if (this.board[sr][c]) return false;
          }
          return true;
        }
        // Check if moving vertically
        if (sc === ec) {
          const step = Math.sign(er - sr);
          for (let r = sr + step; r !== er; r += step) {
            if (this.board[r][sc]) return false;
          }
          return true;
        }
        // Check if moving diagonally
        if (Math.abs(dr) === Math.abs(dc)) {
          const stepR = Math.sign(er - sr);
          const stepC = Math.sign(ec - sc);
          for (let r = sr + stepR, c = sc + stepC; r !== er; r += stepR, c += stepC) {
            if (this.board[r][c]) return false;
          }
          return true;
        }

        return sr === er || sc === ec || Math.abs(dr) === Math.abs(dc);
      }
    }
    return false;
  }
}

function parseInput(input) {
  const parts = input.trim().split(" ");
  if (parts.length !== 2) throw new Error("Invalid input format.");

  if (parts[0].includes(",")) {
    const [sr, sc] = parts[0].split(",").map(Number);
    const [er, ec] = parts[1].split(",").map(Number);
    return [[sr, sc], [er, ec]];
  } else {
    const [start, end] = parts;
    const sc = start.charCodeAt(0) - 'a'.charCodeAt(0);
    const sr = 8 - parseInt(start[1]);
    const ec = end.charCodeAt(0) - 'a'.charCodeAt(0);
    const er = 8 - parseInt(end[1]);
    return [[sr, sc], [er, ec]];
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (query) => new Promise(resolve => rl.question(query, resolve));

  const board = new ChessBoard();
  let turn = 'W';
  let firstMoveWhite = true;
  let firstMoveBlack = true;
  board.printBoard();

  while (true) {
    const input = await ask(`${turn}'s turn. Enter move (e.g. b2 b3 or 1,1 2,1): `);
    try {
      const [start, end] = parseInput(input);
      const piece = board.board[start[0]][start[1]];
      if (!piece || piece.color !== turn) {
        console.log("Invalid piece selection.");
        continue;
      }
      const result = board.movePiece(start, end, turn === 'W' ? firstMoveWhite : firstMoveBlack);
      if (turn === 'W') {
        firstMoveWhite = false
      } else {
        firstMoveBlack = false
      }
      board.printBoard();
      if (result === 'win') {
        console.log(`${turn} wins by capturing the King!`);
        break;
      }
      turn = turn === 'W' ? 'B' : 'W';
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
  rl.close();
}

main();

module.exports = { ChessBoard, ChessPiece };
