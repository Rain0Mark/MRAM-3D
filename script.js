import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  createMRAMMesh,
  createElectronMesh,
  createElectronCloud,
} from "./myMesh.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const scene = new THREE.Scene();
const container = document.getElementById("canvas-container");
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  1,
  1000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 環境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight1.position.set(5, 10, 7);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x90bfff, 0.8);
dirLight2.position.set(-5, 5, -5);
scene.add(dirLight2);

// 添加環境貼圖
const rgbeLoader = new RGBELoader();

rgbeLoader.load("./studio.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// MRAM
const mramMesh = createMRAMMesh();
mramMesh.position.y = -2;
scene.add(mramMesh);

// Fix layer電子
const fixedLayerElectronMesh = createElectronCloud(20, 1, 1.5, 1.5);
const fixedLayerSpin = "up";
fixedLayerElectronMesh.position.set(-1.5, 1.6, 0);
scene.add(fixedLayerElectronMesh);

// Free layer電子
let freeLayerElectronMesh = createElectronCloud(20, 1, 1.5, 1.5);
let freeLayerSpin = "up";
freeLayerElectronMesh.position.set(-1.5, 1, 0);
scene.add(freeLayerElectronMesh);

camera.position.set(0, 2, 5);

function updateButtonStates() {
  const btnWrite0 = document.getElementById("btnWrite0");
  const btnWrite1 = document.getElementById("btnWrite1");
  const btnRead = document.getElementById("btnRead");
  const btnNext = document.getElementById("btnNext");

  const isAnimating = animating !== "none";

  btnWrite0.disabled = isAnimating || freeLayerSpin === "up";
  btnWrite1.disabled = isAnimating || freeLayerSpin === "down";
  btnRead.disabled = isAnimating;
  btnNext.disabled = !isAnimating;
}

// 動畫控制
let animating = "none"; // "write0", "write1", "read"

// 下一步
document.getElementById("btnNext").addEventListener("click", () => {
  if (animating === "write0" && write0StepIndex < write0Steps.length - 1) {
    write0StepIndex++;
    write0gotoStep(write0StepIndex);
  } else if (
    animating === "write1" &&
    write1StepIndex < write1Steps.length - 1
  ) {
    write1StepIndex++;
    write1gotoStep(write1StepIndex);
  } else if (animating === "read" && readStepIndex < readSteps.length - 1) {
    readStepIndex++;
    readgotoStep(readStepIndex);
  }
});

let electronCloud0 = null;
let electronCloud1 = null;

// 動畫：寫入0
let write0StepIndex = 0;
const write0Button = document.getElementById("btnWrite0");
write0Button.addEventListener("click", () => {
  if (animating === "none" && freeLayerSpin === "down") {
    animating = "write0";
	updateButtonStates();
    write0StepIndex = 0;
    write0gotoStep(write0StepIndex);
  }
});

const write0Steps = [
  {
    text: "步驟零：打開wordline電壓，準備寫入。",
    action: (duration) => {
      gsap.to(mramMesh.getObjectByName("wordBit").material, {
        opacity: 0.3,
        duration: duration,
      });
    },
  },
  {
    text: "步驟一：打開source line，形成電流，與固定層自旋方向相反(下)的電子被彈回自由層。",
    action: (duration) => {
      electronCloud0 = createElectronCloud(5, 0, 1, 1);
      electronCloud1 = createElectronCloud(5, 1, 1, 1);
      electronCloud0.position.set(1.5, 0.8, -0.8);
      electronCloud1.position.set(1.5, 0.8, -0.8);
      scene.add(electronCloud0);
      scene.add(electronCloud1);

      gsap.to(mramMesh.getObjectByName("sourceLineBottom").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("sourceLineTop").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("transistorBody").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bottomElectrodeBottom").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bottomElectrodeTop").material, {
        opacity: 0.3,
        duration: duration,
      });


      const tl = gsap.timeline();
      tl.to(electronCloud0.position, { z: 0, duration: duration/3 })
        .to(electronCloud1.position, { z: 0, duration: duration/3 }, "<")
        .to(electronCloud0.position, { y: -2, duration: duration/3 })
        .to(electronCloud1.position, { y: -2, duration: duration/3 }, "<")
        .to(electronCloud0.position, { x: -1.5, duration: duration/3 })
        .to(electronCloud1.position, { x: -1.5, duration: duration/3 }, "<")
        .to(electronCloud0.position, { y: 1.6, duration: duration/3 })
        .to(electronCloud1.position, { y: 1.6, duration: duration/3 }, "<")
        .to(electronCloud0.position, { y: 1, duration: duration });
    },
  },
  {
    text: "步驟二：彈回自由層的電子透過力矩轉移將自由層的電子變成其自旋方向相反(上)。",
    action: (duration) => {
      gsap.to(mramMesh.getObjectByName("sourceLineBottom").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("sourceLineTop").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("transistorBody").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bottomElectrodeBottom").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bottomElectrodeTop").material, {
        opacity: 1,
        duration: duration,
      });

      electronCloud0.remove(...electronCloud0.children);
      electronCloud1.remove(...electronCloud1.children);
      freeLayerElectronMesh.remove(...freeLayerElectronMesh.children);
      freeLayerSpin = "up";
      freeLayerElectronMesh = createElectronCloud(20, 1, 1.5, 1.5);
      freeLayerElectronMesh.position.set(-1.5, 1, 0);
      scene.add(freeLayerElectronMesh);

      gsap.to(mramMesh.getObjectByName("fixedLayer").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("barrier").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("freeLayer").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bitLine").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("wordBit").material, {
        opacity: 1,
        duration: duration,
      });
      write0StepIndex = 0;
      animating = "none";
	  updateButtonStates();

      document.getElementById("cellState").innerText = "電子自旋方向平行(P)";
    },
  },
];

function write0gotoStep(stepIndex) {
  const step = write0Steps[stepIndex];
  document.getElementById("stepLabel").innerText = step.text;
  step.action(1.5);
}

// 動畫：寫入1
let write1StepIndex = 0;
const write1Button = document.getElementById("btnWrite1");
write1Button.addEventListener("click", () => {
  if (animating === "none" && freeLayerSpin === "up") {
    animating = "write1";
	updateButtonStates();
    write1StepIndex = 0;
    write1gotoStep(write1StepIndex);
    console.log("Start write 1 animation");
  }
});

const write1Steps = [
  {
    text: "步驟零：打開wordline電壓，準備寫入。",
    action: (duration) => {
      gsap.to(mramMesh.getObjectByName("wordBit").material, {
        opacity: 0.3,
        duration: duration,
      });
    },
  },
  {
    text: "步驟一：將Bit Line電壓拉高，形成電流。",
    action: (duration) => {
      electronCloud0 = createElectronCloud(5, 0, 1, 1);
      electronCloud1 = createElectronCloud(5, 1, 1, 1);
      electronCloud0.position.set(3, 2.2, 0);
      electronCloud1.position.set(3, 2.2, 0);
      scene.add(electronCloud0);
      scene.add(electronCloud1);

      gsap.to(mramMesh.getObjectByName("bitLine").material, {
        opacity: 0.3,
        duration: duration,
      });

      gsap.to(electronCloud0.position, { x: -1.5, duration: duration });
      gsap.to(electronCloud1.position, { x: -1.5, duration: duration });
    },
  },
  {
    text: "步驟二：電流通過MTJ，只有與固定層相同自旋方向(上)的電子可以抵達自由層。",
    action: (duration) => {
      gsap.to(mramMesh.getObjectByName("fixedLayer").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("barrier").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("freeLayer").material, {
        opacity: 0.3,
        duration: duration,
      });

      gsap.to(electronCloud0.position, { y: 2, duration: duration });
      gsap.to(electronCloud0.position, { y: 2.2, duration: duration });
      gsap.to(electronCloud0.meterial, { opacity: 0, duration: duration });

      gsap.to(electronCloud1.position, { y: 1, duration: duration });
    },
  },
  {
    text: "步驟三：抵達自由層的電子透過力矩轉移將自由層的電子變成其自旋方向相反(下)。",
    action: (duration) => {
      electronCloud0.remove(...electronCloud0.children);
      electronCloud1.remove(...electronCloud1.children);
      freeLayerElectronMesh.remove(...freeLayerElectronMesh.children);
      freeLayerElectronMesh = createElectronCloud(20, 0, 1.5, 1.5);
      freeLayerSpin = "down";
      freeLayerElectronMesh.position.set(-1.5, 1, 0);
      scene.add(freeLayerElectronMesh);

      gsap.to(mramMesh.getObjectByName("fixedLayer").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("barrier").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("freeLayer").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bitLine").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("wordBit").material, {
        opacity: 1,
        duration: duration,
      });
      write1StepIndex = 0;
      animating = "none";
	  updateButtonStates();

      document.getElementById("cellState").innerText = "電子自旋方向反平行(AP)";
    },
  },
];

function write1gotoStep(stepIndex) {
  const step = write1Steps[stepIndex];
  document.getElementById("stepLabel").innerText = step.text;
  step.action(1.5);
}

// 動畫：讀取
let readStepIndex = 0;
const readButton = document.getElementById("btnRead");
readButton.addEventListener("click", () => {
  if (animating === "none") {
    animating = "read";
	updateButtonStates();
    readStepIndex = 0;
    readgotoStep(readStepIndex);
    console.log("Start read animation");
  }
});

const readSteps = [
  {
    text: "步驟零：打開wordline電壓，準備讀取。",
    action: (duration) => {
      gsap.to(mramMesh.getObjectByName("wordBit").material, {
        opacity: 0.3,
        duration: duration,
      });
    },
  },
  {
    text: "步驟一：將Bit Line電壓拉高，形成電流。",
    action: (duration) => {
      electronCloud0 = createElectronCloud(5, 0, 1, 1);
      electronCloud1 = createElectronCloud(5, 1, 1, 1);
      electronCloud0.position.set(3, 2.2, 0);
      electronCloud1.position.set(3, 2.2, 0);
      scene.add(electronCloud0);
      scene.add(electronCloud1);

      gsap.to(mramMesh.getObjectByName("bitLine").material, {
        opacity: 0.3,
        duration: duration,
      });

      gsap.to(electronCloud0.position, { x: -1.5, duration: duration });
      gsap.to(electronCloud1.position, { x: -1.5, duration: duration });
    },
  },
  {
    text: "步驟二：電流通過MTJ，量測到不同的電阻值。",
    action: (duration) => {
      gsap.to(mramMesh.getObjectByName("fixedLayer").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("barrier").material, {
        opacity: 0.3,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("freeLayer").material, {
        opacity: 0.3,
        duration: duration,
      });

      gsap.to(electronCloud0.position, { y: 2, duration: duration });
      gsap.to(electronCloud0.position, { y: 2.2, duration: duration });
      gsap.to(electronCloud0.meterial, { opacity: 0, duration: duration });

      gsap.to(electronCloud1.position, { y: 1, duration: duration });
      gsap.to(electronCloud1.meterial, { opacity: 0, duration: duration });
    },
  },
  {
    text: "步驟三：根據電阻值判斷儲存狀態，讀取完成。",
    action: (duration) => {
      electronCloud0.remove(...electronCloud0.children);
      electronCloud1.remove(...electronCloud1.children);

      gsap.to(mramMesh.getObjectByName("fixedLayer").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("barrier").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("freeLayer").material, {
        opacity: 0.4,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("bitLine").material, {
        opacity: 1,
        duration: duration,
      });
      gsap.to(mramMesh.getObjectByName("wordBit").material, {
        opacity: 1,
        duration: duration,
      });
      readStepIndex = 0;
      animating = "none";
	  updateButtonStates();

      const cellState = freeLayerSpin === "up" ? "0" : "1";
      document.getElementById("readOutput").innerText = cellState;
    },
  },
];

function readgotoStep(stepIndex) {
  const step = readSteps[stepIndex];
  document.getElementById("stepLabel").innerText = step.text;
  step.action(1.5);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

updateButtonStates();
animate();
