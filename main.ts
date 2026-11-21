const fs = require('fs');
const d = process.argv[2] || process.env.MAKEFUN_INPUT_DIR || '/input';
const o = process.argv[3] || process.env.MAKEFUN_OUTPUT_DIR || '/output';

fs.readdirSync(d).forEach(id => {
  const f = `${d}/${id}/level.txt`;
  if (!fs.existsSync(f)) return;
  const lines = fs.readFileSync(f, 'utf8').replace(/\r/g, '').split('\n');
  while (lines.length && lines[lines.length - 1] === '') lines.pop();

  let py = -1, px = -1;
  const grid = lines.map((row, r) => row.split('').map((ch, c) => {
    if (ch === '@' || ch === '+') { py = r; px = c; }
    return ch;
  }));

  const R = grid.length, C = grid[0].length;
  let doors = [];
  for (let c = 0; c < C; c++) {
    const above = py - 1 >= 0 ? grid[py - 1][c] : '#';
    const below = py + 1 < R ? grid[py + 1][c] : '#';
    let doorCell = null;
    if (above !== '#') doorCell = { r: py - 1, c };
    else if (below !== '#') doorCell = { r: py + 1, c };
    if (doorCell) doors.push({ r: doorCell.r, c: doorCell.c, col: c });
  }
  doors.sort((a, b) => a.col - b.col);

  let totalSolution = '';
  let curPlayer = { r: py, c: px };

  const DS = [
    { r: -1, c: 0, ch: 'u', U: 'U' },
    { r: 1, c: 0, ch: 'd', U: 'D' },
    { r: 0, c: -1, ch: 'l', U: 'L' },
    { r: 0, c: 1, ch: 'r', U: 'R' }
  ];

  function bfsFloor(startR, startC, boxesSet, roomCellsSet) {
    const q = [{ r: startR, c: startC, path: '' }];
    const visited = new Set([`${startR},${startC}`]);
    const paths = new Map([[`${startR},${startC}`, '']]);
    let head = 0;
    while (head < q.length) {
      const curr = q[head++];
      for (const d of DS) {
        const nr = curr.r + d.r;
        const nc = curr.c + d.c;
        const key = `${nr},${nc}`;
        if (roomCellsSet.has(key) && !boxesSet.has(key) && !visited.has(key)) {
          visited.add(key);
          const npath = curr.path + d.ch;
          paths.set(key, npath);
          q.push({ r: nr, c: nc, path: npath });
        }
      }
    }
    return { paths, region: visited };
  }

  for (const door of doors) {
    const roomCellsSet = new Set();
    const roomKeysQueue = [{ r: door.r, c: door.c }];
    const roomVisited = new Set([`${door.r},${door.c}`]);
    roomCellsSet.add(`${door.r},${door.c}`);

    let qh = 0;
    while (qh < roomKeysQueue.length) {
      const cur = roomKeysQueue[qh++];
      for (const d of DS) {
        const nr = cur.r + d.r;
        const nc = cur.c + d.c;
        if (nr === py) continue;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] !== '#') {
          const k = `${nr},${nc}`;
          if (!roomVisited.has(k)) {
            roomVisited.add(k);
            roomCellsSet.add(k);
            roomKeysQueue.push({ r: nr, c: nc });
          }
        }
      }
    }
    const entryKey = `${py},${door.col}`;
    roomCellsSet.add(entryKey);

    const boxes = [];
    const goals = [];
    for (const k of roomCellsSet) {
      const [r, c] = k.split(',').map(Number);
      const ch = grid[r][c];
      if (ch === '$' || ch === '*') boxes.push(k);
      if (ch === '.' || ch === '*') goals.push(k);
    }
    boxes.sort();
    goals.sort();
    const goalsSet = new Set(goals);

    if (curPlayer.r === py && curPlayer.c !== door.col) {
      while (curPlayer.c < door.col) { totalSolution += 'r'; curPlayer.c++; }
      while (curPlayer.c > door.col) { totalSolution += 'l'; curPlayer.c--; }
    }

    if (boxes.length === 0) {
      curPlayer = { r: py, c: door.col };
      continue;
    }

    const initBoxes = [...boxes].sort();
    const initFloor = bfsFloor(py, door.col, new Set(initBoxes), roomCellsSet);
    const initRegionKey = Array.from(initFloor.region).sort().join(',');

    const q = [{
      boxes: initBoxes,
      pr: py,
      pc: door.col,
      sol: ''
    }];
    const visited = new Set([initBoxes.join(',') + '|' + initRegionKey]);
    let solvedState = null;
    let qHead = 0;

    while (qHead < q.length) {
      const st = q[qHead++];
      const boxSet = new Set(st.boxes);

      if (st.boxes.every(b => goalsSet.has(b))) {
        solvedState = st;
        break;
      }

      const floor = bfsFloor(st.pr, st.pc, boxSet, roomCellsSet);

      for (const boxStr of st.boxes) {
        const [br, bc] = boxStr.split(',').map(Number);
        for (const d of DS) {
          const fr = br - d.r;
          const fc = bc - d.c;
          const fromKey = `${fr},${fc}`;
          if (!floor.paths.has(fromKey)) continue;

          const dr = br + d.r;
          const dc = bc + d.c;
          const destKey = `${dr},${dc}`;

          if (!roomCellsSet.has(destKey)) continue;
          if (boxSet.has(destKey)) continue;

          const upW = !roomCellsSet.has(`${dr - 1},${dc}`);
          const downW = !roomCellsSet.has(`${dr + 1},${dc}`);
          const leftW = !roomCellsSet.has(`${dr},${dc - 1}`);
          const rightW = !roomCellsSet.has(`${dr},${dc + 1}`);
          const corner = (!goalsSet.has(destKey)) && ((upW && leftW) || (upW && rightW) || (downW && leftW) || (downW && rightW));
          if (corner) continue;

          const newBoxes = st.boxes.map(b => b === boxStr ? destKey : b).sort();
          const walkPath = floor.paths.get(fromKey);
          const nextFloor = bfsFloor(br, bc, new Set(newBoxes), roomCellsSet);
          const nextRegionKey = Array.from(nextFloor.region).sort().join(',');
          const stateKey = newBoxes.join(',') + '|' + nextRegionKey;

          if (!visited.has(stateKey)) {
            visited.add(stateKey);
            q.push({
              boxes: newBoxes,
              pr: br,
              pc: bc,
              sol: st.sol + walkPath + d.U
            });
          }
        }
      }
    }

    if (solvedState !== null) {
      totalSolution += solvedState.sol;
      const finalFloor = bfsFloor(solvedState.pr, solvedState.pc, new Set(solvedState.boxes), roomCellsSet);
      const exitPath = finalFloor.paths.get(entryKey);
      if (exitPath !== undefined) {
        totalSolution += exitPath;
      }
      curPlayer = { r: py, c: door.col };
    }
  }

  const outIdDir = `${o}/${id}`;
  if (!fs.existsSync(outIdDir)) fs.mkdirSync(outIdDir, { recursive: true });
  fs.writeFileSync(`${outIdDir}/solution.txt`, totalSolution);
});
