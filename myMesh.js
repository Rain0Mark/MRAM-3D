import * as THREE from "three";

export function createMRAMMesh() {
  // 💡 預先定義重複使用的科技感金屬質感
  const metalRoughness = 0.15;
  const metalMetalness = 0.9;

  // 物體：電晶體
  const transitorGroup = new THREE.Group();

  // 矽基底：啞光、深灰、沉穩
  const transistorBodyGeometry = new THREE.BoxGeometry(5, 1, 3);
  const transistorBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 1,
  });
  const transistorBody = new THREE.Mesh(
    transistorBodyGeometry,
    transistorBodyMaterial,
  );
  transistorBody.name = "transistorBody";

  // Word Line (閘極電極)：微亮金屬質感
  const wordBitGeometry = new THREE.BoxGeometry(1, 0.5, 3);
  const wordBitMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 1,
  });
  const wordBit = new THREE.Mesh(wordBitGeometry, wordBitMaterial);
  wordBit.name = "wordBit";
  wordBit.position.set(0, 0.75, 0);

  transitorGroup.add(transistorBody);
  transitorGroup.add(wordBit);
  transitorGroup.position.set(0, 0, 0);

  // 物體：Source Line（紫色金屬導線）
  const sourceLineGroup = new THREE.Group();
  const sourceLineMaterial = new THREE.MeshStandardMaterial({
    color: 0xb536db, // 稍微調深一點的科技紫
    roughness: metalRoughness,
    metalness: metalMetalness,
    transparent: true,
    opacity: 1,
  });

  const sourceLineBottomGeometry = new THREE.CylinderGeometry(0.35, 0.35, 2);
  const sourceLineBottom = new THREE.Mesh(
    sourceLineBottomGeometry,
    sourceLineMaterial,
  ); // 💡 共用材質
  sourceLineBottom.name = "sourceLineBottom";

  const sourceLineTopGeometry = new THREE.BoxGeometry(1, 0.5, 3);
  const sourceLineTop = new THREE.Mesh(
    sourceLineTopGeometry,
    sourceLineMaterial,
  ); // 💡 共用材質
  sourceLineTop.position.set(0, 1, 0);
  sourceLineTop.name = "sourceLineTop";

  sourceLineGroup.add(sourceLineBottom);
  sourceLineGroup.add(sourceLineTop);
  sourceLineGroup.position.set(1.5, 1.5, 0);

  // 物體：Bottom Electrode（藍色金屬電極柱）
  const bottomElectrodeGroup = new THREE.Group();
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x22aed1, // 亮眼科技藍
    roughness: metalRoughness,
    metalness: metalMetalness,
    transparent: true,
    opacity: 1,
  });

  const bottomElectrodeBottomGeometry = new THREE.CylinderGeometry(
    0.35,
    0.35,
    2,
  );
  const bottomElectrodeBottom = new THREE.Mesh(
    bottomElectrodeBottomGeometry,
    electrodeMaterial,
  );
  bottomElectrodeBottom.name = "bottomElectrodeBottom";

  const bottomElectrodeTopGeometry = new THREE.BoxGeometry(2, 0.5, 2);
  const bottomElectrodeTop = new THREE.Mesh(
    bottomElectrodeTopGeometry,
    electrodeMaterial,
  );
  bottomElectrodeTop.name = "bottomElectrodeTop";
  bottomElectrodeTop.position.set(0, 1, 0);

  bottomElectrodeGroup.add(bottomElectrodeBottom);
  bottomElectrodeGroup.add(bottomElectrodeTop);
  bottomElectrodeGroup.position.set(-1.5, 1.5, 0);

  // 物體：MTJ (核心結構)
  const mtjGroup = new THREE.Group();

  // 💡 固定層 (綠色)：微帶發光，透光度調到 0.4 讓內部電子一清二楚
  const fixedLayerGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.8);
  const fixedLayerMaterial = new THREE.MeshStandardMaterial({
    color: 0x38ef7d,
    emissive: 0x116633, // 淡淡的綠色自發光
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.4, // 降低不透明度，徹底看穿內部
  });
  const fixedLayer = new THREE.Mesh(fixedLayerGeometry, fixedLayerMaterial);
  fixedLayer.name = "fixedLayer";

  // 💡 絕緣氧化層 (橘色 MgO Barrier)：陶瓷玻璃質感，高透光度
  const barrierGeometry = new THREE.BoxGeometry(1.8, 0.2, 1.8);
  const barrierMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7b00,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.3,
  });
  const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
  barrier.name = "barrier";
  barrier.position.set(0, 0.35, 0);

  // 💡 自由層 (黃色)：微帶發光，透光度一樣調低
  const freeLayerGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.8);
  const freeLayerMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe600,
    emissive: 0x554400, // 淡淡的黃色自發光
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.4, // 降低不透明度
  });
  const freeLayer = new THREE.Mesh(freeLayerGeometry, freeLayerMaterial);
  freeLayer.name = "freeLayer";
  freeLayer.position.set(0, 0.7, 0);

  mtjGroup.add(fixedLayer);
  mtjGroup.add(barrier);
  mtjGroup.add(freeLayer);
  mtjGroup.position.set(-1.5, 3, 0);

  // 物體：Bit Line（頂部紅色金屬導線）
  const bitLineGeometry = new THREE.BoxGeometry(6, 0.5, 1);
  const bitLineMaterial = new THREE.MeshStandardMaterial({
    color: 0xe63946, // 質感的金屬紅
    roughness: metalRoughness,
    metalness: metalMetalness,
    transparent: true,
    opacity: 1,
  });
  const bitLine = new THREE.Mesh(bitLineGeometry, bitLineMaterial);
  bitLine.name = "bitLine";
  bitLine.position.set(0, 4.2, 0);

  // MRAM
  const mramGroup = new THREE.Group();
  mramGroup.add(transitorGroup);
  mramGroup.add(sourceLineGroup);
  mramGroup.add(bottomElectrodeGroup);
  mramGroup.add(mtjGroup);
  mramGroup.add(bitLine);

  return mramGroup;
}

export function createElectronMesh(spin) {
  const electronGroup = new THREE.Group();

  const electronGeometry = new THREE.SphereGeometry(0.12); // 💡 可以稍微放大一點點

  // 💡 改用自發光材質
  const electronMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8,
  });
  const electron = new THREE.Mesh(electronGeometry, electronMaterial);

  const arrowColor = spin === 1 ? 0xff3838 : 0x3838ff;
  const dir =
    spin === 1 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
  const arrowHelper = new THREE.ArrowHelper(
    dir,
    new THREE.Vector3(0, 0, 0),
    0.25,
    arrowColor,
    0.08,
    0.08,
  );

  electronGroup.add(electron);
  electronGroup.add(arrowHelper);

  return electronGroup;
}

export function createElectronCloud(numElectrons, spin, weidth, depth) {
  const cloudGroup = new THREE.Group();

  for (let i = 0; i < numElectrons; i++) {
    const electronMesh = createElectronMesh(spin);

    if (spin == 0) electronMesh.name = "electronDown";
    else electronMesh.name = "electronUp";

    electronMesh.position.set(
      (Math.random() - 0.5) * weidth,
      0,
      (Math.random() - 0.5) * depth,
    );

    cloudGroup.add(electronMesh);
  }

  return cloudGroup;
}
