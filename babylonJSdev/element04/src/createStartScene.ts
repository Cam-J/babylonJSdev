// --------------------------------------------------
// TOP OF CODE - IMPORTING BABYLONJS
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    Texture,
    StandardMaterial,
    Color3,
    ShadowGenerator,
    PointLight,
    SpotLight,
    DirectionalLight,
    Space,
    CubeTexture,
    Sprite,
    SpriteManager,
    MeshLODLevel,
    MaterialPluginHardBindForSubMesh,
    VertexBuffer,
    BoxParticleEmitter,
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    Sound,
  } from "@babylonjs/core";
  import HavokPhysics from "@babylonjs/havok";
  import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  import * as GUI from "@babylonjs/gui";
  // ----------------------------------------------
  // initialse physics
  let initializedHavok;
  HavokPhysics().then((havok) => {
    initializedHavok = havok;
  });

  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);

  globalThis.HK = await HavokPhysics();

  // ----------------------------------------
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  // Menu
  function createSceneButton(scene: Scene, name: string, index: string, x: string, 
    y: string, advtex){
     var button = GUI.Button.CreateSimpleButton(name, index);
     button.left = x; 
     button.top = y; 
     button.width = "160px"
     button.height = "60px"; 
     button.color = "white"; 
     button.cornerRadius = 20; 
     button.background = "green";
     const buttonClick = new Sound("MenuClickSFX", "./audio/menu-click.wav", scene, null, {
      loop: false, 
      autoplay: false, 
     });
     button.onPointerUpObservable.add(function() {
     //-- error handling -- console.log("THE BUTTON HAS BEEN CLICKED");
     buttonClick.play();
     });
     advtex.addControl(button); 
     return button; 
    }

  //-----------------------------------------------
  // MIDDLE OF CODE - FUNCTIONS
  // Detailed ground
  /* function createBox(scene: Scene, x: number, y: number, z: number){
    let box: Mesh = MeshBuilder.CreateBox("box", {});
    box.position.x = x; 
    box.position.y = y; 
    box.position.z = z; 
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 10 }, scene);
    return box; 
   } 
    
   function createGround(scene: Scene) {
    const ground: Mesh = MeshBuilder.CreateGround("ground", {height: 10, width: 10, 
   subdivisions: 4});
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, 
   scene);
    return ground;
   }
  
  let keyDownMap: any[] = [];

  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, 
    function(newMeshes, particleSystems, skeletons) {
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

        if (keydown){
          if (!animating) {
            animating = true; 
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
          } 
        } else { 
          animating = false; 
          scene.stopAnimation(skeleton);
        }
        // collision
        if (mesh.intersectsMesh(collider)) {
          console.log("COLLIDED");
        }
      });
      // physiccs collision
      item = mesh;
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, {mass: 0}, scene);
      playerAggregate.body.disablePreStep = false;

    });
    return item; 
  } 

  function actionManager(scene: Scene){
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction( 
    new ExecuteCodeAction(
    {
      trigger: ActionManager.OnKeyDownTrigger, 
    },
    function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
    ));
    
    scene.actionManager.registerAction( 
      new ExecuteCodeAction({ 
      trigger: ActionManager.OnKeyUpTrigger},
      function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
    ));
  return scene.actionManager; 
  }
  */
  // --------------------------------------------
  // Create skybox
  function createSkybox(scene: Scene){
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

  function createHemiLight(scene: Scene){
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  function createArcRotateCamera(scene: Scene, canvas: HTMLCanvasElement) {
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
    camera.attachControl(canvas, true);
    return camera;
  }
  // ---------------------------------------------------

  // ---------------------------------------------------
  // BOTTOM OF CODE - MAIN RENDERING AREA FOR SCENE
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      importMesh?: any;
      actionManager?: any;
      camera?: Camera;
      ground?: Mesh;
      skybox?: Mesh;
      box?: Mesh;
    }
  
    let that: SceneData = { scene: new Scene(engine) };

    // initialize physics
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    // any further code here
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI",true);
    let button1 = createSceneButton(that.scene, "but1", "Start Game","0px", "-75px", advancedTexture);
    let button2 = createSceneButton(that.scene, "but2", "Options","0px", "0px", advancedTexture);
    
    //--------------------------------------------------
    //that.ground = createGround(that.scene);
    that.skybox = createSkybox(that.scene);
    //that.box = createBox(that.scene, 2, 2, 3);
    //that.importMesh = importPlayerMesh(that.scene, that.box, 0, 0);
    //that.actionManager = actionManager(that.scene);
    // scene lighting and camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene, canvas);

    return that;
  }
