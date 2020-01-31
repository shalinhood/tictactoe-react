import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Each Square is a button that can be clicked once. The value is X, O, or null
function Square(props) {
  // Expects to be give:
  // className: The css class to use
  // onClick: The function to be called when the Square is clicked
  // value: 'X', 'O', or null to be displayed in the Square
    return (
      <button className={props.className} onClick={props.onClick}>
        {props.value}
      </button>
    );
}

// Creates the grid of Squares as controlled by the Game
class Board extends React.Component {
  // Expects to be given:
  // squares: Array(9) of the values of the squares
  // onClick: The function to be called when a Square is clicked
  // winSquares: Array(3) of the indices of the squares that form the winning line
  renderSquare(i) {
    // Conditionally set the css className of the Square if it is part of the winning 3
    let bgColor = "square"
    if (this.props.winSquares != null && (this.props.winSquares[0] === i || this.props.winSquares[1] === i || this.props.winSquares[2] === i)) {
      bgColor = "winner"
    }
    return (
    <Square className={bgColor}
    value={this.props.squares[i]}
    onClick={() => this.props.onClick(i)}
    />
    );
  }

  createBoard = () => {
    let board = []

    for (let i = 0; i < 3; i++)
    {
      let row = []
      for (let j = 0; j < 3; j++)
      {
        const squareNum = i * 3 + j
        row.push(this.renderSquare(squareNum))
      }
      board.push(<div>{row}</div>)
    }
    return board
  }

  render() {
    return (
      <div>
        {this.createBoard()}
      </div>
    );
  }
}

// Controls creating the Board & Squares and holds the turn history
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        // Each turn taken will add another Array(9) that gets filled up with X's and O's
        squares: Array(9).fill(null)
      }],
      xIsNext: true, // Handles whos turn it is
      stepNumber: 0, // Counts the turns taken
      moveOrder: Array(1).fill(null), // Records which square was selected each turn
      boldMove: null, // Designates which turn in the history to bold
      movesDescending: true // Handles the direction the history is shown
    };
  }

  // This will eventually be the Square's onClick
  handleClick(i) {
    // Make a copy of the history and edit that version to maintain the previous board state
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const pastMoves = this.state.moveOrder.slice(0, this.state.stepNumber + 1);

    // No moves allowed if there has been a winner or the Square was already selected
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    // Sets what symbol the Square should show
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    // Updates the Game's state with new values
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      moveOrder: pastMoves.concat(i),
      boldMove: null
    });
  }

  // Allows for jumping back to a previous board state
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      boldMove: step,
    });
  }

  // Changes the order that the moves are shown (ascending or descending)
  flipMoves() {
    this.setState({
      movesDescending: !this.state.movesDescending
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    // Create the list of buttons that show the previous moves
    const moves = history.map((step, move) => {
      move = this.state.movesDescending ? move : history.length - move - 1;
      const col  = this.state.moveOrder[move] % 3;
      const row = (this.state.moveOrder[move] - (this.state.moveOrder[move] % 3)) / 3;

      const desc = move ?
        'Go to move #' + move + ' (' + row + ',' + col + ')':
        'Go to game start';

      const buttonClass = this.state.boldMove === move ? "boldMove" : "" ;
      return (
        <li key={move}>
          <button className={buttonClass} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    // The line of text above the list of moves
    let status;
    if (winner) {
      status = 'Winner: ' + current.squares[winner[0]];
    } else if (history.length >= 10) {
      status = "Draw"
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winSquares={winner}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div><button onClick={() => this.flipMoves()}>Flip Moves</button></div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [ // All possible winning lines
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i] // if a winner was found, then return the Array(3) of the indices of the winning Squares
    }
  }
  return null;
}