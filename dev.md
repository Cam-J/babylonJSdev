# Element 05 Documentation

# Element 05 Documentation

# GameScene.ts Documentation

## Top of Code - Importing BabylonJS

This section imports necessary modules and libraries for Babylon.js, including tools for debugging and inspecting the scene, various scene components, the GUI module, and the Havok physics engine.
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

This section of the code imports a model to act as the player, handles animation of the model, and allows for user input to control directional movement. This code also includes the handling of physics to aid in identifying when the player collides with an object.
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

  ## Skybox
  This code adds a skybox to the background of the scene.
  ```Typescript
  function createSkybox(scene: Scene) {
    //Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }
  ```

  ## ArcRotateCamera

  This is the light used in the scene to provide lighting on the objects present.
  ```Typescript
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(false);
    return camera;
  }
  ```

  ## Rendering Area

  ```typescript
  export default function GameScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      ground?: Mesh;
      importMesh?: any;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      spotLight?: SpotLight;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      spheres?: Mesh;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    //initialise physics
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);

    //----------------------------------------------------------

    //any further code goes here-----------
    that.box = createBox(that.scene, 2, 2, 2);
    that.box = createBox(that.scene, -1.5, 5, -3.2);
    that.box = createBox(that.scene, 1.2, 1, -2);
    that.box = createBox(that.scene, 2.3, 2.3, 0.4);
    that.ground = createGround(that.scene);
    that.spheres = createSphere(that.scene, 0.4, 1, 2.4);
    that.spheres = createSphere(that.scene, 4.2, 1, -1.3);
    that.spheres = createSphere(that.scene, -1.2, 1, 0.6);
    that.spheres = createSphere(that.scene, -3, 1, 4.1);
    that.spheres = createSphere(that.scene, 1, 1, -4);
    that.importMesh = importPlayerMesh(that.scene, that.spheres, 0, 0);
    that.actionManager = actionManager(that.scene);
    let button1 = createMenuButton(that.scene, "but1", "Menu", "-600px", "-200px", advancedTexture);

    that.skybox = createSkybox(that.scene);
    //Scene Lighting & Camerar
    that.hemisphericLight = createHemiLight(that.scene);
    that.spotLight = createSpotLight(that.scene, 2, 5, 2);
    that.camera = createArcRotateCamera(that.scene);

    let shadowGenerator = new ShadowGenerator(1024, that.spotLight);
    shadowGenerator.addShadowCaster(that.box);
    shadowGenerator.useExponentialShadowMap = true;
    return that;
  }
  ```
  # MenuScene.ts documentation

  ## Top of Code - Importing BabylonJS

  This section imports necessary modules and libraries for Babylon.js, including tools for debugging and inspecting the scene, various scene components, the GUI module, and the Havok physics engine.
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
  ## GUI Button Text
  This function creates a GUI text block with specified properties, such as text content, color, font size, and position. It adds the text block to the provided advanced texture and returns the created text block.
  ```typescript
  function createText(scene: Scene, theText: string, x: string, y: string, s: string, c: string, advtex) {
    let text = new GUI.TextBlock();
    text.text = theText;
    text.color = c;
    text.fontSize = s;
    text.fontWeight = "bold"; //can add parameter for this if you wish
    text.left = x;
    text.top = y;
    advtex.addControl(text);
    return text;
  }
  ```

  ## GUI Rectangle Button
  This function generates a GUI rectangle with specified properties, including dimensions, position, corner radius, color, thickness, and background. It adds the rectangle to the provided advanced texture and returns the created rectangle.
  ```typescript
    function createRectangle(scene: Scene, w: string, h: string, x: string, y: string, cr: number, c: string, t: number, bg: string, advtext) {
    let rectangle = new GUI.Rectangle();
    rectangle.width = w;
    rectangle.height = h;
    rectangle.left = x;
    rectangle.top = y;
    rectangle.cornerRadius = cr;
    rectangle.color = c;
    rectangle.thickness = t;
    rectangle.background = bg;
    advtext.addControl(rectangle);
    return rectangle;
  }
  ```

  ## Create Menu Button
  This function produces a GUI button with specific properties like position, size, color, and style. It also includes a sound effect on button click and sets up a callback function to change the scene index when the button is clicked.
  ```typescript
  function createSceneButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
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
            setSceneIndex(1);
        });
        advtex.addControl(button);
        return button;
 }
  ```
  ## Skybox
  This function creates a skybox in the scene using Babylon.js MeshBuilder. It applies a standard material with a cube texture for the skybox effect.This function creates a skybox in the scene using Babylon.js MeshBuilder. It applies a standard material with a cube texture for the skybox effect.
  ```typescript
    //Create Skybox
  function createSkybox(scene: Scene) {
    //Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }
  ```

  ## ArcRotateCamera
  This function sets up an arc-rotate camera with specified initial parameters, such as alpha, beta, distance, and target position. It enables user control for camera rotation.
  ```typescript
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  ```

  ## Rendering Area
  This is the main function for rendering the menu scene. It sets up the scene, GUI elements (text, buttons), skybox, lighting (hemispheric light), and camera (arc-rotate camera). The function returns an object containing the scene and optional elements like skybox, light, hemispheric light, and camera.
  ```typescript
  export default function MenuScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    //----------------------------------------------------------

    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
    let textBG = createRectangle(that.scene, "600px", "100px", "0px", "-200px", 20, "Black", 4, "Teal", advancedTexture);
    let titleText = createText(that.scene, "Collect The Things", "0px", "-200px", "45", "White", advancedTexture);
    let button1 = createSceneButton(that.scene, "but1", "Start Game", "0px", "-75px", advancedTexture);

    that.skybox = createSkybox(that.scene);
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
  ```
