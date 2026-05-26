import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "assets", "skill-tree");
const DATA_URL = "https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/0.5.0/data.json";

const data = await fetch(DATA_URL).then((response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch tree data: ${response.status}`);
  }

  return response.json();
});

const nodes = data.nodes;
const adjacency = buildAdjacency();

const ASCENDANCY_STARTS = {
  Warrior1: "32534",
  Warrior3: "5852",
  Ranger1: "46990",
  Ranger3: "1583"
};

const GUIDES = {
  "shield-wall": {
    title: "Shield Wall Warrior",
    start: "47175",
    panels: {
      "1-12": ["5710", "7721"],
      "13-22": ["5710", "7721", "32416", "45363", "64327", "27950"],
      "23-31": ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "25482", "50609"],
      "32-44": ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921"],
      "45-60": ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921", "53823", "59589", "10500", "45751", "12000"],
      "61-75": ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921", "53823", "59589", "10500", "45751", "36808", "37244", "25482", "12000", "24807", "60634"],
      endgame: ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921", "53823", "59589", "10500", "45751", "36808", "37244", "25482", "50609", "25429", "24807", "30115", "12000"]
    }
  },
  "ice-shot": {
    title: "Ice Shot Deadeye",
    start: "50459",
    panels: {
      "1-12": ["28992", "35987", "42781", "20831"],
      "13-22": ["28992", "35987", "42781", "20831", "50795", "56493"],
      "23-31": ["28992", "35987", "42781", "20831", "50795", "56493", "17854", "32683", "30"],
      "32-44": ["28992", "35987", "42781", "20831", "50795", "56493", "17854", "32683", "44974", "9421", "38329", "336", "30", "59913"],
      "45-60": ["28992", "35987", "42781", "20831", "50795", "56493", "17854", "32683", "44974", "9421", "38329", "336", "56999", "8904", "11526", "30", "12033"],
      "61-75": ["28992", "35987", "42781", "20831", "50795", "56493", "17854", "32683", "44974", "9421", "38329", "336", "56999", "8904", "11526", "35477", "60764", "23221", "47560", "30", "12033", "5817"],
      endgame: ["28992", "35987", "42781", "20831", "50795", "56493", "17854", "32683", "44974", "9421", "38329", "336", "56999", "8904", "11526", "35477", "60764", "23221", "47560", "30", "12033", "5817"]
    }
  },
  "lightning-arrow": {
    title: "Lightning Arrow Deadeye",
    start: "50459",
    panels: {
      "1-12": ["28992", "35987", "42781", "20831"],
      "13-22": ["28992", "35987", "42781", "20831", "50795", "56493"],
      "23-31": ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "30"],
      "32-44": ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "30", "59913"],
      "45-60": ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "336", "12611", "17854", "40480", "30", "12033"],
      "61-75": ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "336", "12611", "17854", "40480", "8904", "11526", "60764", "23221", "30", "12033", "5817"],
      endgame: ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "336", "12611", "17854", "40480", "8904", "11526", "60764", "23221", "56999", "47560", "30", "12033", "5817"]
    }
  },
  "bow-variants": {
    title: "Bow Variants",
    start: "50459",
    panels: {
      "1-12": ["28992", "35987", "42781", "10053"],
      "13-22": ["28992", "35987", "42781", "10053", "43677"],
      "23-31": ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "41619"],
      "32-44": ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "41619", "29074"],
      "45-60": ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "50912", "38895", "41619", "29074", "40"],
      "61-75": ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "50912", "38895", "50795", "19337", "41210", "60764", "23221", "47560", "41619", "29074", "40", "16433"],
      endgame: ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "50912", "38895", "50795", "19337", "41210", "60764", "23221", "47560", "8904", "11526", "35477", "41619", "29074", "40", "16433"]
    }
  }
};

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [slug, guide] of Object.entries(GUIDES)) {
  for (const [level, targets] of Object.entries(guide.panels)) {
    const selected = buildSelectedNodes(guide.start, targets);
    const svg = renderSvg(`${guide.title} ${level}`, selected, new Set(targets));
    fs.writeFileSync(path.join(OUT_DIR, `${slug}-${level}.svg`), svg);
  }
}

function buildAdjacency() {
  const result = new Map();

  for (const [id, node] of Object.entries(nodes)) {
    result.set(id, new Set([...(node.out || []), ...(node.in || [])].map(String)));
  }

  return result;
}

function buildSelectedNodes(start, targets) {
  const selected = new Set([start]);

  for (const target of targets) {
    const node = nodes[target];

    if (!node) {
      throw new Error(`Missing node ${target}`);
    }

    const path = node.ascendancyId
      ? shortestPath(ASCENDANCY_STARTS[node.ascendancyId], target, node.ascendancyId)
      : shortestPath(start, target, null);

    for (const id of path) {
      selected.add(id);
    }
  }

  return selected;
}

function shortestPath(start, target, ascendancyId) {
  if (!start) {
    throw new Error(`Missing start for target ${target}`);
  }

  const queue = [start];
  const previous = new Map([[start, null]]);

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];

    if (current === target) {
      break;
    }

    for (const next of adjacency.get(current) || []) {
      if (previous.has(next)) {
        continue;
      }

      const node = nodes[next];

      if (!node || !canVisit(node, ascendancyId)) {
        continue;
      }

      previous.set(next, current);
      queue.push(next);
    }
  }

  if (!previous.has(target)) {
    throw new Error(`No path ${start} -> ${target}`);
  }

  const path = [];

  for (let current = target; current; current = previous.get(current)) {
    path.push(current);
  }

  return path.reverse();
}

function canVisit(node, ascendancyId) {
  if (ascendancyId) {
    return node.ascendancyId === ascendancyId || node.isAscendancyStart;
  }

  return !node.ascendancyId && !node.isAscendancyStart && node.id !== null;
}

function renderSvg(title, selected, targets) {
  const normal = [...selected].filter((id) => !nodes[id].ascendancyId && !nodes[id].isAscendancyStart);
  const ascendancyIds = [...selected].filter((id) => nodes[id].ascendancyId || nodes[id].isAscendancyStart);
  const hasAscendancy = ascendancyIds.length > 0;
  const ascendancyCount = ascendancyIds.filter((id) => !nodes[id].isAscendancyStart).length;
  const width = 1440;
  const height = 900;
  const headerHeight = 88;
  const panes = [];

  if (normal.length) {
    panes.push({
      title: "Passive tree route",
      ids: normal,
      x: 36,
      y: headerHeight,
      width: hasAscendancy ? 948 : 1368,
      height: 760,
      type: "normal"
    });
  }

  if (hasAscendancy) {
    panes.push({
      title: "Ascendancy choices",
      ids: ascendancyIds,
      x: 1014,
      y: headerHeight,
      width: 390,
      height: 760,
      type: "ascendancy"
    });
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)} selected passive tree nodes">`,
    '<defs><pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 L 0 0 0 44" fill="none" stroke="#263040" stroke-width="1"/></pattern><filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>',
    '<rect width="100%" height="100%" fill="#0f1218"/>',
    '<rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" opacity="0.16"/>',
    `<text x="36" y="42" fill="#f5d28d" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(title)}</text>`,
    `<text x="36" y="70" fill="#aeb7c8" font-family="Segoe UI, Arial, sans-serif" font-size="17">Gold path = allocated route, cyan ring = priority node, regular passives: ${normal.length}, ascendancy passives: ${ascendancyCount}/8 separate</text>`
  ];

  panes.forEach((pane, index) => parts.push(renderPane(pane, selected, targets, index)));
  parts.push("</svg>");

  return parts.join("\n");
}

function renderPane(pane, selected, targets, index) {
  const coords = pane.ids.map((id) => nodes[id]).filter((node) => Number.isFinite(node.x) && Number.isFinite(node.y));
  const minX = Math.min(...coords.map((node) => node.x));
  const maxX = Math.max(...coords.map((node) => node.x));
  const minY = Math.min(...coords.map((node) => node.y));
  const maxY = Math.max(...coords.map((node) => node.y));
  const margin = pane.type === "normal" ? 700 : 240;
  const bounds = { minX: minX - margin, maxX: maxX + margin, minY: minY - margin, maxY: maxY + margin };
  const background = getBackgroundNodes(bounds, pane.type, pane.ids);
  const paneSelected = new Set(pane.ids);
  const targetIds = new Set([...targets].filter((id) => paneSelected.has(id)));
  const scale = Math.min(
    pane.width / Math.max(1, bounds.maxX - bounds.minX),
    (pane.height - 52) / Math.max(1, bounds.maxY - bounds.minY)
  );
  const contentWidth = (bounds.maxX - bounds.minX) * scale;
  const contentHeight = (bounds.maxY - bounds.minY) * scale;
  const offsetX = pane.x + (pane.width - contentWidth) / 2;
  const offsetY = pane.y + 52 + (pane.height - 52 - contentHeight) / 2;
  const clipId = `pane-${index}`;
  const parts = [
    "<g>",
    `<clipPath id="${clipId}"><rect x="${pane.x}" y="${pane.y + 52}" width="${pane.width}" height="${pane.height - 52}" rx="14"/></clipPath>`,
    `<rect x="${pane.x}" y="${pane.y}" width="${pane.width}" height="${pane.height}" rx="18" fill="#151a22" stroke="#31394a"/>`,
    `<text x="${pane.x + 22}" y="${pane.y + 34}" fill="#dbe5f4" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(pane.title)}</text>`,
    `<g clip-path="url(#${clipId})">`
  ];
  const project = (node) => ({
    x: offsetX + (node.x - bounds.minX) * scale,
    y: offsetY + (node.y - bounds.minY) * scale
  });

  for (const [a, b] of getEdges(background)) {
    const from = project(nodes[a]);
    const to = project(nodes[b]);
    const selectedEdge = paneSelected.has(a) && paneSelected.has(b);
    parts.push(`<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="${selectedEdge ? "#e9b95f" : "#30394a"}" stroke-width="${selectedEdge ? 3.2 : 1.2}" opacity="${selectedEdge ? 0.95 : 0.42}"/>`);
  }

  for (const id of background) {
    const node = nodes[id];
    const point = project(node);
    const isSelected = paneSelected.has(id);
    const isTarget = targetIds.has(id);
    const radius = isTarget ? 10 : isSelected ? 6.5 : 3.2;
    const fill = isTarget ? "#45e3ff" : isSelected ? "#e9b95f" : "#485269";
    const stroke = isTarget ? "#f8d987" : isSelected ? "#f8d987" : "#202838";
    const opacity = isSelected || isTarget ? 1 : 0.42;
    const filter = isTarget ? ' filter="url(#glow)"' : "";
    parts.push(`<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${isTarget ? 3 : 1.4}" opacity="${opacity}"${filter}/>`);
  }

  [...targetIds].filter((id) => nodes[id].name).slice(0, 18).forEach((id, labelIndex) => {
    const node = nodes[id];
    const point = project(node);
    const anchorRight = point.x < pane.x + pane.width * 0.64;
    const labelX = anchorRight ? point.x + 14 : point.x - 14;
    const labelY = point.y + ((labelIndex % 3) - 1) * 18;
    const text = node.name.length > 26 ? `${node.name.slice(0, 24)}...` : node.name;
    parts.push(`<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="${anchorRight ? "start" : "end"}" fill="#f8f2df" stroke="#0f1218" stroke-width="4" paint-order="stroke" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">${escapeXml(text)}</text>`);
  });

  parts.push("</g>", "</g>");
  return parts.join("\n");
}

function getBackgroundNodes(bounds, type, ids) {
  const selected = new Set(ids);
  const background = new Set(ids);

  for (const [id, node] of Object.entries(nodes)) {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      continue;
    }

    const isAscendancy = node.ascendancyId || node.isAscendancyStart;

    if (type === "normal" && isAscendancy) {
      continue;
    }

    if (type === "ascendancy" && !isAscendancy) {
      continue;
    }

    if (node.x < bounds.minX || node.x > bounds.maxX || node.y < bounds.minY || node.y > bounds.maxY) {
      continue;
    }

    background.add(id);
  }

  for (const id of selected) {
    for (const next of adjacency.get(id) || []) {
      if (!nodeIsInPane(nodes[next], bounds, type)) {
        continue;
      }

      background.add(next);
    }
  }

  return [...background].filter((id) => nodes[id] && Number.isFinite(nodes[id].x) && Number.isFinite(nodes[id].y));
}

function nodeIsInPane(node, bounds, type) {
  if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) {
    return false;
  }

  const isAscendancy = node.ascendancyId || node.isAscendancyStart;

  if (type === "normal" && isAscendancy) {
    return false;
  }

  if (type === "ascendancy" && !isAscendancy) {
    return false;
  }

  return node.x >= bounds.minX && node.x <= bounds.maxX && node.y >= bounds.minY && node.y <= bounds.maxY;
}

function getEdges(ids) {
  const idSet = new Set(ids);
  const seen = new Set();
  const edges = [];

  for (const id of ids) {
    for (const next of adjacency.get(id) || []) {
      if (!idSet.has(next)) {
        continue;
      }

      const key = [id, next].sort().join("-");

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      edges.push([id, next]);
    }
  }

  return edges;
}

function escapeXml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[char]);
}
