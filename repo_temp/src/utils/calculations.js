// ─── Unit Conversion ──────────────────────────────────────────────────────────
export function toMeters(value, unit) {
  if (unit === 'imperial') return value * 0.3048; // ft to m
  return value;
}

export function fromMeters(value, unit) {
  if (unit === 'imperial') return value / 0.3048;
  return value;
}

export function toM3(value, unit) {
  if (unit === 'imperial') return value * 0.0283168; // ft3 to m3
  return value;
}

// ─── Concrete Calculator ──────────────────────────────────────────────────────
export function calcConcrete({ length, width, depth, unit, mixRatio = '1:2:4', slabs = 1 }) {
  const l = unit === 'imperial' ? toMeters(length, unit) : length;
  const w = unit === 'imperial' ? toMeters(width, unit) : width;
  const d = unit === 'imperial' ? toMeters(depth, unit) : depth;

  if (!l || !w || !d || l <= 0 || w <= 0 || d <= 0) return null;

  const [c, s, a] = mixRatio.split(':').map(Number);

  const wetVolume = l * w * d * slabs;
  const dryVolume = wetVolume * 1.54; // dry volume factor

  const total = c + s + a;
  const cementVol = (c / total) * dryVolume;
  const sandVol = (s / total) * dryVolume;
  const aggregateVol = (a / total) * dryVolume;

  const cementDensity = 1440; // kg/m3
  const cementKg = cementVol * cementDensity;
  const cementBags = Math.ceil(cementKg / 50);
  const waterLitres = cementKg * 0.5;

  return {
    volumeM3: parseFloat(wetVolume.toFixed(4)),
    dryVolumeM3: parseFloat(dryVolume.toFixed(4)),
    cementBags50kg: cementBags,
    cementKg: parseFloat(cementKg.toFixed(2)),
    sand_m3: parseFloat(sandVol.toFixed(4)),
    sandKg: parseFloat((sandVol * 1600).toFixed(2)),
    aggregate_m3: parseFloat(aggregateVol.toFixed(4)),
    aggregateKg: parseFloat((aggregateVol * 1500).toFixed(2)),
    water_L: parseFloat(waterLitres.toFixed(1)),
    mixRatio,
  };
}

// ─── Block & Brick Calculator ─────────────────────────────────────────────────
export function calcBlockBrick({ length, height, thickness, mortarJoint = 10, blockType = 'brick', walls = 1, unit }) {
  const l = unit === 'imperial' ? toMeters(length, unit) : length;
  const h = unit === 'imperial' ? toMeters(height, unit) : height;

  if (!l || !h || l <= 0 || h <= 0) return null;

  const wallArea = l * h * walls;
  const mortarJointM = mortarJoint / 1000;

  let blockW, blockH, blockD;
  const wasteFactor = 1.10;

  if (blockType === 'brick') {
    blockW = 0.230 + mortarJointM;
    blockH = 0.076 + mortarJointM;
    blockD = 0.115;
  } else if (blockType === 'block') {
    blockW = 0.440 + mortarJointM;
    blockH = 0.215 + mortarJointM;
    blockD = 0.100;
  } else { // hollow_block
    blockW = 0.390 + mortarJointM;
    blockH = 0.190 + mortarJointM;
    blockD = 0.190;
  }

  const blocksPerM2 = 1 / (blockW * blockH);
  const blockCount = Math.ceil(wallArea * blocksPerM2 * wasteFactor);

  // Mortar calculation
  const wallVolume = l * h * blockD * walls;
  const solidBlockVol = blockCount * (blockW - mortarJointM) * (blockH - mortarJointM) * blockD;
  const mortarVol = wallVolume - (blockCount * (blockW - mortarJointM) * (blockH - mortarJointM) * blockD * 0.85);
  const mortarVolActual = Math.max(wallVolume * 0.3, 0.05) * walls;

  // 1:6 cement:sand mix for mortar
  const cementBags = Math.ceil((mortarVolActual * 1440) / (7 * 50));
  const sandKg = Math.ceil(mortarVolActual * 1440 * 6 / 7);

  return {
    wallArea: parseFloat(wallArea.toFixed(2)),
    blockCount,
    blocksPerM2: parseFloat(blocksPerM2.toFixed(1)),
    mortarVol: parseFloat(mortarVolActual.toFixed(3)),
    mortarBags: cementBags,
    sandKg,
    cementBags,
    wasteFactor: 10,
    blockType,
  };
}

// ─── Paint Calculator ─────────────────────────────────────────────────────────
export function calcPaint({ length, width, height, doors = 0, windows = 0, coats = 2, paintType = 'emulsion', includeCeiling = false, includePrimer = true, unit }) {
  const l = unit === 'imperial' ? toMeters(length, unit) : length;
  const w = unit === 'imperial' ? toMeters(width, unit) : width;
  const h = unit === 'imperial' ? toMeters(height, unit) : height;

  if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) return null;

  const perimeterWalls = 2 * (l + w) * h;
  const doorArea = doors * 1.8;
  const windowArea = windows * 1.2;
  const deductions = doorArea + windowArea;
  const wallArea = perimeterWalls - deductions;
  const ceilingArea = includeCeiling ? l * w : 0;
  const totalPaintableArea = wallArea + ceilingArea;

  let coveragePerLitre;
  switch (paintType) {
    case 'gloss': coveragePerLitre = 12; break;
    case 'satinwood': coveragePerLitre = 11; break;
    default: coveragePerLitre = 10;
  }

  const paintLitres = parseFloat(((totalPaintableArea * coats) / coveragePerLitre).toFixed(2));
  const primerLitres = includePrimer ? parseFloat(((totalPaintableArea * 1) / 12).toFixed(2)) : 0;

  return {
    wallArea: parseFloat(wallArea.toFixed(2)),
    ceilingArea: parseFloat(ceilingArea.toFixed(2)),
    totalArea: parseFloat(totalPaintableArea.toFixed(2)),
    paintableArea: parseFloat(totalPaintableArea.toFixed(2)),
    deductions: parseFloat(deductions.toFixed(2)),
    paintLitres,
    primerLitres,
    coats,
    coveragePerLitre,
  };
}

// ─── Floor & Tile Calculator ──────────────────────────────────────────────────
export function calcFloorTile({ length, width, tileLength, tileWidth, groutWidth = 3, pattern = 'straight', tilesPerBox = 10, unit }) {
  const l = unit === 'imperial' ? toMeters(length, unit) : length;
  const w = unit === 'imperial' ? toMeters(width, unit) : width;
  const tl = tileLength / 1000; // mm to m
  const tw = tileWidth / 1000;

  if (!l || !w || l <= 0 || w <= 0 || tl <= 0 || tw <= 0) return null;

  const floorArea = l * w;

  let wastePct;
  switch (pattern) {
    case 'diagonal': wastePct = 0.15; break;
    case 'herringbone': wastePct = 0.20; break;
    default: wastePct = 0.10;
  }

  const groutM = groutWidth / 1000;
  const tilesPerM2 = 1 / ((tl + groutM) * (tw + groutM));
  const tileCount = Math.ceil(floorArea * tilesPerM2 * (1 + wastePct));
  const boxCount = Math.ceil(tileCount / tilesPerBox);

  // Adhesive: ~4.5 kg/m²
  const adhesiveKg = parseFloat((floorArea * 4.5).toFixed(1));
  // Grout: ~0.6 kg/m²
  const groutKg = parseFloat((floorArea * 0.6).toFixed(1));

  return {
    floorArea: parseFloat(floorArea.toFixed(2)),
    tilesPerM2: parseFloat(tilesPerM2.toFixed(1)),
    tileCount,
    boxCount,
    wastePct: Math.round(wastePct * 100),
    adhesiveKg,
    groutKg,
    pattern,
  };
}

// ─── Roofing Calculator ───────────────────────────────────────────────────────
export function calcRoofing({ length, width, pitch = 30, roofType = 'gable', material = 'concrete_tiles', unit }) {
  const l = unit === 'imperial' ? toMeters(length, unit) : length;
  const w = unit === 'imperial' ? toMeters(width, unit) : width;

  if (!l || !w || l <= 0 || w <= 0) return null;

  const footprintArea = l * w;
  const pitchRad = (pitch * Math.PI) / 180;
  const pitchFactor = 1 / Math.cos(pitchRad);

  let roofArea;
  let ridgingM;
  let flashingM;

  if (roofType === 'flat') {
    roofArea = footprintArea * 1.05;
    ridgingM = 0;
    flashingM = 2 * (l + w);
  } else if (roofType === 'hip') {
    roofArea = footprintArea * pitchFactor * 1.05;
    ridgingM = (l - w) > 0 ? l - w : 0.5;
    flashingM = 2 * (l + w) * 0.7;
  } else if (roofType === 'lean_to') {
    roofArea = (l * w * pitchFactor);
    ridgingM = l;
    flashingM = l + 2 * w;
  } else { // gable
    roofArea = footprintArea * pitchFactor;
    ridgingM = l;
    flashingM = 2 * w * pitchFactor;
  }

  roofArea = parseFloat(roofArea.toFixed(2));

  let unitsPerM2, unitName;
  switch (material) {
    case 'clay_tiles':
      unitsPerM2 = 12; unitName = 'tiles'; break;
    case 'metal_sheets':
      unitsPerM2 = 0.5; unitName = 'sheets'; break;
    case 'asphalt_shingles':
      unitsPerM2 = 7; unitName = 'shingles'; break;
    default: // concrete_tiles
      unitsPerM2 = 10; unitName = 'tiles'; break;
  }

  const unitCount = Math.ceil(roofArea * unitsPerM2 * 1.10);
  const underlayM2 = parseFloat((roofArea * 1.10).toFixed(2));

  return {
    footprintArea: parseFloat(footprintArea.toFixed(2)),
    roofArea,
    pitchFactor: parseFloat(pitchFactor.toFixed(3)),
    unitCount,
    unitName,
    ridgingM: parseFloat(ridgingM.toFixed(2)),
    flashingM: parseFloat(flashingM.toFixed(2)),
    underlayM2,
    material,
    roofType,
  };
}

// ─── Steel Reinforcement Calculator ──────────────────────────────────────────
export function calcSteel({ length, width, spacing, barDiameter, layers = 1, unit }) {
  const l = unit === 'imperial' ? toMeters(length, unit) : length;
  const w = unit === 'imperial' ? toMeters(width, unit) : width;
  const spacingM = spacing / 1000; // mm to m
  const diaM = barDiameter / 1000; // mm to m

  if (!l || !w || !spacingM || !diaM || l <= 0 || w <= 0 || spacingM <= 0 || diaM <= 0) return null;

  // Bars in X direction (span length, spaced in width)
  const barsX = Math.ceil(w / spacingM) + 1;
  // Bars in Y direction (span width, spaced in length)
  const barsY = Math.ceil(l / spacingM) + 1;

  const totalBars = (barsX + barsY) * layers;
  const totalLengthX = barsX * l * layers;
  const totalLengthY = barsY * w * layers;
  const totalLength = parseFloat((totalLengthX + totalLengthY).toFixed(2));

  // Steel density 7850 kg/m3
  const radius = diaM / 2;
  const crossSection = Math.PI * radius * radius;
  const weightKg = parseFloat((totalLength * crossSection * 7850).toFixed(2));
  const tonnage = parseFloat((weightKg / 1000).toFixed(4));

  return {
    barsX,
    barsY,
    totalBars,
    totalLengthX: parseFloat(totalLengthX.toFixed(2)),
    totalLengthY: parseFloat(totalLengthY.toFixed(2)),
    totalLengthM: totalLength,
    weightKg,
    tonnage,
    barDiameter,
    spacing,
    layers,
  };
}

// ─── Cement Sand Aggregate (Mix Design) ──────────────────────────────────────
export function calcCSA({ volume, mixRatio = '1:2:4', unit }) {
  const vol = unit === 'imperial' ? toM3(volume, unit) : volume;

  if (!vol || vol <= 0) return null;

  const [c, s, a] = mixRatio.split(':').map(Number);
  const dryVolume = vol * 1.54;
  const total = c + s + a;

  const cementVol = (c / total) * dryVolume;
  const sandVol = (s / total) * dryVolume;
  const aggregateVol = (a / total) * dryVolume;

  const cementDensity = 1440;
  const sandDensity = 1600;
  const aggregateDensity = 1500;

  const cementKg = parseFloat((cementVol * cementDensity).toFixed(2));
  const sandKg = parseFloat((sandVol * sandDensity).toFixed(2));
  const aggregateKg = parseFloat((aggregateVol * aggregateDensity).toFixed(2));
  const cementBags = Math.ceil(cementKg / 50);
  const waterLitres = parseFloat((cementKg * 0.5).toFixed(1));

  return {
    volumeM3: parseFloat(vol.toFixed(4)),
    dryVolumeM3: parseFloat(dryVolume.toFixed(4)),
    cementKg,
    cementBags,
    cementVol: parseFloat(cementVol.toFixed(4)),
    sandKg,
    sandVol: parseFloat(sandVol.toFixed(4)),
    aggregateKg,
    aggregateVol: parseFloat(aggregateVol.toFixed(4)),
    waterLitres,
    mixRatio,
  };
}

// ─── Material Quantity Calculator ────────────────────────────────────────────
export function calcMaterialQty({ itemType, dimensions, unit }) {
  if (!itemType || !dimensions) return null;
  switch (itemType) {
    case 'concrete': return calcConcrete({ ...dimensions, unit });
    case 'brick': return calcBlockBrick({ ...dimensions, blockType: 'brick', unit });
    case 'paint': return calcPaint({ ...dimensions, unit });
    case 'tile': return calcFloorTile({ ...dimensions, unit });
    default: return null;
  }
}

// ─── Cost Estimator ───────────────────────────────────────────────────────────
export function calcCost({ items, markup = 0, contingency = 0, vatRate = 0, currency = 'GBP' }) {
  const categories = { Materials: 0, Labour: 0, Equipment: 0, Overhead: 0 };
  const breakdown = items.map(item => {
    const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    const cat = item.category || 'Materials';
    categories[cat] = (categories[cat] || 0) + total;
    return { ...item, total };
  });

  const subtotal = Object.values(categories).reduce((a, b) => a + b, 0);
  const markupAmt = subtotal * (markup / 100);
  const contingencyAmt = (subtotal + markupAmt) * (contingency / 100);
  const subtotalWithMarkup = subtotal + markupAmt + contingencyAmt;
  const vatAmt = subtotalWithMarkup * (vatRate / 100);
  const grandTotal = subtotalWithMarkup + vatAmt;

  return {
    breakdown,
    categories,
    subtotal: parseFloat(subtotal.toFixed(2)),
    markupAmt: parseFloat(markupAmt.toFixed(2)),
    contingencyAmt: parseFloat(contingencyAmt.toFixed(2)),
    vatAmt: parseFloat(vatAmt.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
  };
}
