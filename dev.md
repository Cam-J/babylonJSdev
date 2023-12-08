# Notes
Initial set up after issues with previous enviroment - 26/10/23

# ELEMENT 05
-- Player model random model
-- Fixed Camera to player model
-- When player model interact with target 
-- target drops stuff
-- player picks up stuff
-- counter goes up
-- when player gets bored
-- player opens menu
-- player resets game
-- reset counter
-- go again

# Element 05 Documentation

# GameScene.ts Documentation

## Top of Code - Importing BabylonJS

This code handles the necessary imports for BabylonJS as well as any custom functions.

```typescript
import setSceneIndex from "./index";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    SpotLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    Color3,
    Space,
    ShadowGenerator,
    PointLight,
    DirectionalLight,
    CubeTexture,
    Sprite,
    SpriteManager,
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    Sound
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
```

## Initialization of Physics

This code initializes Havok and sets up globarl variables for use later in the code.

```Typescript
let initializedHavok;
HavokPhysics().then((havok) => {
  initializedHavok = havok;
});

const havokInstance = await HavokPhysics();
const havokPlugin = new HavokPlugin(true, havokInstance);

globalThis.HK = await HavokPhysics();
```

## Counter Text

This code was intended to control a section on the GUI where a counter would indicate how many collectables had been touched.
This code did not appear to work after an issue with Dcoker. The GUI does not display the counter but it runs in the background.
```Typescript
const counterText = new GUI.TextBlock();
counterText.text = "Collision Counter: 0";
counterText.color = "White";
counterText.fontSize = 20;
```

## Create Menu Button

This code provides the button screen that returns a player to the menu when they are finished with the game or wish to reload.
This also stopped working when an issue with Docker happened, the GUI is present but the reload function is not functional.
```Typescript
function createMenuButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
    let button = GUI.Button.CreateSimpleButton(name, index);
        button.left = x;
        button.top = y;
        button.width = "160px";
        button.height = "60px";
        button.color = "Black";
        button.cornerRadius = 20;
        button.background = "Teal";

        const buttonClick = new Sound("MenuClickSFX", "./audio/menu-click.wav", scene, null, {
          loop: false,
          autoplay: false,
        });

        button.onPointerUpObservable.add(function() {
            console.log("It's not broken");
            buttonClick.play();
            setSceneIndex(0);

            // reload page
            window.location.reload();
        });
        advtex.addControl(button);
        return button;
    }
```

## Player movement and Mesh

This section of the code imports a model to act as the player, handles animation of model and allows for user input to control directional movement, This code also includes 
the handling of physics to aid in identifying when the player collides with an object.
```Typescript
let keyDownMap: any[] = [];
let walkingSpeed: number = 0.001;

function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1; 

      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
      // let runRange: any = skeleton.getAnimationRange("YBot_Run");
      // let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
      // let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");
      // let idleRange: any = skeleton.getAnimationRange("YBot_Idle");

      let animating: boolean = false;

      scene.onBeforeRenderObservable.add(()=> {
        let keydown: boolean = false;
        let shiftdown: boolean = false;
        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.position.z += 0.1;
          mesh.rotation.y = 0;
          keydown = true;
        }
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.position.x -= 0.1;
          mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.position.z -= 0.1;
          mesh.rotation.y = 2 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.position.x += 0.1;
          mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }
        if (keydown) {
          if (!animating) {
            animating = true;
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
          }
        } else {
          animating = false;
          scene.stopAnimation(skeleton);
        }

        //collision
        if (mesh.intersectsMesh(collider)) {
          console.log("COLLIDED");
          collisionCounter++;
          updateCounterDisplay();
        }
        if (collisionCounter === 5){
            console.log("Game Over");
            setSceneIndex(0);
        }
        
      });

      //physics collision
      item = mesh;
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
      playerAggregate.body.disablePreStep = false;

    });
    return item;
  }
  ```
  ## Collision Counter
  
  Updates the counter that should be displayed but instead counts in the background.
  Had to be placed after player mesh as it did not register the count when placed before the player mesh function.
  ```Typescript
    let collisionCounter = 0;
  function updateCounterDisplay(){
    counterText.text = "Balls Collected: " + collisionCounter;
  }
  ```

  ## Action Manager

  This code handles the recognition of a key event for player movement, if key is pressed then move if key is not pressed do not move.
  ```Typescript
  function actionManager(scene: Scene){
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyDownTrigger,
          //parameters: 'w'
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
      )
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
      )
    );
    return scene.actionManager;
  } 
  ```
  ## Objects in scene
  ### Ground
  This code adds a ground for the player character to walk on and adds walls to indicate the play area. The walls are added to the edge of the ground to create an open box.
  ```Typescript
    function createGround(scene: Scene) {
    const ground: Mesh = MeshBuilder.CreateGround("ground", {height: 10, width: 10, subdivisions: 4});
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    ground.receiveShadows = true;
    // Ground colour
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = Color3.Random();
    ground.material = groundMaterial;

    // Add walls
    const wallHeight = 5; // Adjust the wall height as needed
    const wallThickness = 0.1; // Adjust the wall thickness as needed
    // Wall colour
    const wallMaterial = new StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = Color3.Black();
    wallMaterial.alpha = 0.5;

    const wall1 = MeshBuilder.CreateBox("wall1", { height: wallHeight, width: 10, depth: wallThickness }, scene);
    wall1.position = new Vector3(0, wallHeight / 2, 5);
    wall1.material = wallMaterial;

    //const wall2 = MeshBuilder.CreateBox("wall2", { height: wallHeight, width: 10, depth: wallThickness }, scene);
    //wall2.position = new Vector3(0, wallHeight / 2, -5);
    //wall2.material = WallMaterial;

    const wall3 = MeshBuilder.CreateBox("wall3", { height: wallHeight, width: wallThickness, depth: 10 }, scene);
    wall3.position = new Vector3(5, wallHeight / 2, 0);
    wall3.material = wallMaterial;

    const wall4 = MeshBuilder.CreateBox("wall4", { height: wallHeight, width: wallThickness, depth: 10 }, scene);
    wall4.position = new Vector3(-5, wallHeight / 2, 0);
    wall4.material = wallMaterial;
    
    return ground;
  }
  ```
  ### Box

  This code creates a box that is later used to create a number of boxes with randomized colours as decoration for the scene and to indicate the physics aspect of a player being able to move an object.
  ```Typescript
  function createBox(scene: Scene, x: number, y: number, z: number) {
    let box: Mesh = MeshBuilder.CreateBox("box", { });
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;

    // apply random colour 
    const boxMaterial = new StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = new Color3(Math.random(), Math.random(), Math.random());
    box.material = boxMaterial;

    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return box;
  }

  ```
  ### Sphere
  
  The spheres are the 'collectables' and this function creates small spheres that will be called upon set locations for a player to intersect which then causes the counter to increment, this code handles the creation of these spheres.
  ```Typescript
    function createSphere(scene: Scene, x: number, y: number, z: number) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 0.5, segments: 12 },
      scene,
    );
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    
    const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 0 }, scene);

    return sphere;
  }

  ```