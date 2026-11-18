const boardElement = document.querySelector("#chessboard");
const startCoordinateElement = document.querySelector("#start-coordinate");
const endCoordinateElement = document.querySelector("#end-coordinate");
const findRouteButton = document.querySelector("#find-route");
const resetBoardButton = document.querySelector("#reset-board");
const routeResultElement = document.querySelector("#route-result");

const boardSize = 8;
const knightMoveset = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];
const files = "abcdefgh";

let startPosition = null;
let endPosition = null;
let currentPath = [];

function isValidPosition(position) {
  return (
    Array.isArray(position) &&
    position.length === 2 &&
    position.every(
      (coordinate) =>
        Number.isInteger(coordinate) &&
        coordinate >= 0 &&
        coordinate < boardSize,
    )
  );
}

function positionKey(position) {
  return `${position[0]},${position[1]}`;
}

function knightMoves(start, end) {
  if (!isValidPosition(start) || !isValidPosition(end)) {
    throw new RangeError("Las posiciones deben estar dentro del tablero (0–7).");
  }

  const queue = [[...start]];
  const previousPositions = new Map([[positionKey(start), null]]);

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const currentPosition = queue[queueIndex];

    if (positionKey(currentPosition) === positionKey(end)) {
      break;
    }

    for (const [fileOffset, rankOffset] of knightMoveset) {
      const nextPosition = [
        currentPosition[0] + fileOffset,
        currentPosition[1] + rankOffset,
      ];
      const nextKey = positionKey(nextPosition);

      if (isValidPosition(nextPosition) && !previousPositions.has(nextKey)) {
        previousPositions.set(nextKey, currentPosition);
        queue.push(nextPosition);
      }
    }
  }

  const path = [];
  let position = [...end];

  while (position !== null) {
    path.push(position);
    position = previousPositions.get(positionKey(position)) ?? null;
  }

  return path.reverse();
}

function coordinateLabel(position) {
  if (!position) {
    return "Sin elegir";
  }

  return `[${position[0]}, ${position[1]}]`;
}

function squareLabel(position) {
  return `${files[position[0]]}${position[1] + 1}`;
}

function renderBoard() {
  boardElement.replaceChildren();

  for (let rank = boardSize - 1; rank >= 0; rank -= 1) {
    for (let file = 0; file < boardSize; file += 1) {
      const position = [file, rank];
      const square = document.createElement("button");
      const isOnPath = currentPath.some(
        (pathPosition) => positionKey(pathPosition) === positionKey(position),
      );

      square.type = "button";
      square.className = `square ${(file + rank) % 2 === 0 ? "square-light" : "square-dark"}`;
      square.setAttribute("aria-label", `Casilla ${squareLabel(position)}`);
      square.setAttribute("aria-pressed", "false");

      if (isOnPath) {
        square.classList.add("on-path");
      }
      if (positionKey(position) === positionKey(startPosition ?? [-1, -1])) {
        square.classList.add("start-square");
        square.setAttribute("aria-label", `Inicio, casilla ${squareLabel(position)}`);
        square.setAttribute("aria-pressed", "true");
      }
      if (positionKey(position) === positionKey(endPosition ?? [-1, -1])) {
        square.classList.add("end-square");
        square.setAttribute("aria-label", `Destino, casilla ${squareLabel(position)}`);
        square.setAttribute("aria-pressed", "true");
      }

      square.addEventListener("click", () => selectPosition(position));
      boardElement.append(square);
    }
  }
}

function selectPosition(position) {
  if (startPosition && endPosition) {
    startPosition = [...position];
    endPosition = null;
    currentPath = [];
    showPlaceholder();
  } else if (!startPosition) {
    startPosition = [...position];
  } else {
    endPosition = [...position];
    currentPath = [];
    showPlaceholder();
  }

  updateSelection();
  renderBoard();
}

function updateSelection() {
  startCoordinateElement.textContent = coordinateLabel(startPosition);
  endCoordinateElement.textContent = coordinateLabel(endPosition);
  findRouteButton.disabled = !startPosition || !endPosition;
}

function showPlaceholder() {
  routeResultElement.replaceChildren();
  const placeholder = document.createElement("p");
  placeholder.className = "result-placeholder";
  placeholder.textContent = "Tu ruta aparecerá aquí, paso a paso.";
  routeResultElement.append(placeholder);
}

function showRoute(path) {
  routeResultElement.replaceChildren();

  const heading = document.createElement("p");
  heading.className = "route-summary";
  heading.textContent = `¡Listo! ${path.length - 1} ${
    path.length - 1 === 1 ? "movimiento" : "movimientos"
  }`;

  const list = document.createElement("ol");
  list.className = "route-list";

  for (const position of path) {
    const step = document.createElement("li");
    const notation = document.createElement("span");
    const coordinates = document.createElement("span");

    notation.className = "route-notation";
    notation.textContent = squareLabel(position);
    coordinates.textContent = coordinateLabel(position);
    step.append(notation, coordinates);
    list.append(step);
  }

  routeResultElement.append(heading, list);
}

findRouteButton.addEventListener("click", () => {
  currentPath = knightMoves(startPosition, endPosition);
  showRoute(currentPath);
  renderBoard();
});

resetBoardButton.addEventListener("click", () => {
  startPosition = null;
  endPosition = null;
  currentPath = [];
  showPlaceholder();
  updateSelection();
  renderBoard();
});

updateSelection();
renderBoard();
