import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const objLoader = new OBJLoader();
let obj = null;

const Params = {
    color: "#fff",
    metalness: 1,
    roughness: 0.51,
    envMapIntensity: 0.9,
    clearcoat: 1,
    transparent: true,
    transmission: .95,
    opacity: .5,
    reflectivity: 0.2,
    ior: 0.9,
    side: THREE.DoubleSide,
    showHelpers: false,
    paused: false
};

objLoader.load(
    '/prism/models/prism.obj',
    function (loadedObject) {
        obj = loadedObject;
        loadedObject.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.material = new THREE.MeshPhysicalMaterial({
                    color: Params.color,
                    metalness: Params.metalness,
                    roughness: Params.roughness,
                    envMapIntensity: Params.envMapIntensity,
                    clearcoat: Params.clearcoat,
                    transparent: Params.transparent,
                    // transmission: Params.transmission, // Uncomment if needed
                    opacity: Params.opacity,
                    reflectivity: Params.reflectivity,
                    ior: Params.ior,
                    side: Params.side,
                });
            }
        });
        scene.add(obj);
        obj.position.y = -1.8;
        obj.position.x = -1.14;
        obj.scale.set(0.324, 0.324, 0.324);

        // Material GUI folder (code unchanged)
        const matFolder = gui.addFolder('Material Params');
        matFolder.addColor(Params, 'color')
            .name('Color')
            .onChange((value) => {
                loadedObject.traverse((child) => {
                    if (child.isMesh) {
                        child.material.color.set(value);
                    }
                });
            });
        // (Additional material controls here ...)
        matFolder.add(Params, 'metalness').min(0).max(2).step(0.001).name('Metalness')
            .onChange((value) => {
                loadedObject.traverse((child) => {
                    if (child.isMesh) child.material.metalness = value;
                });
            });
        matFolder.add(Params, 'roughness').min(0).max(1).step(0.001).name('Roughness')
            .onChange((value) => {
                loadedObject.traverse((child) => {
                    if (child.isMesh) child.material.roughness = value;
                });
            });
        // ... other material parameters follow
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened', error);
    }
);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,
        side: THREE.DoubleSide
    })
);
floor.receiveShadow = true;
floor.rotation.x = - Math.PI * 0.5;
// scene.add(floor)

/**
 * Lights
 */

const lightsGroup = new THREE.Group();
scene.add(lightsGroup);

const directionalLight1 = new THREE.DirectionalLight('rgb(0,0,81)', 1.8);
directionalLight1.position.set(5, 5, 5);
directionalLight1.castShadow = true;
const helper1 = new THREE.DirectionalLightHelper(directionalLight1);
helper1.visible = Params.showHelpers;

const directionalLight2 = new THREE.DirectionalLight('rgb(0,0,81)', 5);
directionalLight2.position.set(-2, 1, -4);
const helper2 = new THREE.DirectionalLightHelper(directionalLight2);
helper2.visible = Params.showHelpers;

const directionalLight3 = new THREE.DirectionalLight('rgb(255,255,255)', 2);
directionalLight3.position.set(0, -5, -3);
const helper3 = new THREE.DirectionalLightHelper(directionalLight3);
scene.add(helper3,directionalLight3)
helper3.visible = Params.showHelpers;



const directionalLight4 = new THREE.DirectionalLight('rgb(0,0,81)', 0.5);
directionalLight4.position.set(6, 2, -3);
const helper4 = new THREE.DirectionalLightHelper(directionalLight4);
helper4.visible = Params.showHelpers;

const directionalLight5 = new THREE.DirectionalLight('rgb(0,0,81)', 0.1);
directionalLight5.position.set(-3, 2, 5);
const helper5 = new THREE.DirectionalLightHelper(directionalLight5);
helper5.visible = Params.showHelpers;

const directionalLight6 = new THREE.DirectionalLight('rgb(0,0,81)', 0.1);
directionalLight6.position.set(-7, 6, 5);
const helper6 = new THREE.DirectionalLightHelper(directionalLight6);
helper6.visible = Params.showHelpers;

lightsGroup.add(
    directionalLight1, directionalLight2, directionalLight4, directionalLight5, directionalLight6,
    helper1, helper2, helper4, helper5, helper6
);

const lights = [
    { light: directionalLight1, name: 'Directional Light 1' },
    { light: directionalLight2, name: 'Directional Light 2' },
    { light: directionalLight3, name: 'Directional Light 3' },
    { light: directionalLight4, name: 'Directional Light 4' },
    { light: directionalLight5, name: 'Directional Light 5' },
    { light: directionalLight6, name: 'Directional Light 6' },
];

gui.add(Params, 'paused')
   .name('Pause Animation')
   .onChange((value) => {
       if (!value) {
           tick();
       }
   });

const helpers = [ helper1, helper2, helper3, helper4, helper5, helper6 ];
gui.add(Params, 'showHelpers').name('Show Helpers').onChange((value) => {
    helpers.forEach(helper => {
      helper.visible = value;
    });
});

lights.forEach((entry) => {
    const folder = gui.addFolder(entry.name);
    folder.add(entry.light, 'intensity', 0, 10, 0.1).name('Intensity');
    folder.add(entry.light.position, 'x', -20, 20, 0.1).name('Position X');
    folder.add(entry.light.position, 'y', -20, 20, 0.1).name('Position Y');
    folder.add(entry.light.position, 'z', -20, 20, 0.1).name('Position Z');
    folder.addColor(entry.light, 'color').name('Color');
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 3.5);
scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let accumulatedTime = 0;

const tick = () => {
    const delta = clock.getDelta();
    if (!Params.paused) {
        accumulatedTime += delta;
    }
    lightsGroup.rotation.x = accumulatedTime * 0.01 * (Math.PI * 2);
    lightsGroup.rotation.y = accumulatedTime * 0.1 * (Math.PI * 2);
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
