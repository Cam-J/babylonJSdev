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
  } from "@babylonjs/core";
  // ----------------------------------------------
  
  //-----------------------------------------------
  // MIDDLE OF CODE - FUNCTIONS
  // Terrain
  function createTerrain(scene: Scene){
    //Create large ground for valley environment
    const largeGroundMat = new StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png");
      
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
    largeGround.material = largeGroundMat;

    return largeGround;
  }

  // Detailed ground
  function createGround(scene: Scene){
    //Create Village ground
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/villagegreen.png");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground = MeshBuilder.CreateGround("ground", {width:24, height:24});
    ground.material = groundMat;
    ground.position.y = 0.01;
    return ground;
  }

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

  // create some trees
  function createTrees(scene: Scene){
    const spriteManagerTrees = new SpriteManager("treesManager", "textures/palmtree.png", 2000, {width: 512, height: 1024}, scene);

    //We create trees at random positions
    for (let i = 0; i < 500; i++) {
        const tree = new Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (-30);
        tree.position.z = Math.random() * 20 + 8;
        tree.position.y = 0.5;
    }

    for (let i = 0; i < 500; i++) {
        const tree = new Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (25) + 7;
        tree.position.z = Math.random() * -35  + 8;
        tree.position.y = 0.5;
    }
    
    return spriteManagerTrees;
  }

  function createBox(scene: Scene){
    const boxMat = new StandardMaterial("boxMat");
    boxMat.diffuseTexture = new Texture("textures/cubehouse.png");

    //options parameter to set different images on each side
    const faceUV: Vector4[] = [];
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    // top 4 and bottom 5 not seen so not set

    const box = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true}, scene);
    box.position.y = 0.5;
    box.material = boxMat;

    return box;
  }

  function createRoof(scene: Scene){
    //texture
    const roofMat = new StandardMaterial("roofMat");
    roofMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg");

    const roof = MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;
    roof.material = roofMat;


    return roof;
  }

  function createHouse(scene: Scene){
    const house = new Mesh("house", scene);
    const box = createBox(scene);
    const roof = createRoof(scene);

    box.parent = house;
    roof.parent = house;
    return house;
  }

  function cloneHouses(scene: Scene){
    const house = new Mesh("house", scene);
    const box = createBox(scene);
    const roof = createRoof(scene);

    box.parent = house;
    roof.parent = house;

    const clonedHouse = house.clone("clonedHouse");
    clonedHouse.position.x = 1;

    return clonedHouse;
  }
  // --------------------------------------------

  function createHemiLight(scene: Scene){
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh){
    // only spotlight, point and directional can cast shadows
    switch (index) {
      case 1: // hemispheric
      const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
      hemiLight.intensity = 0.1;
      return hemiLight;
      break;
      case 2: // spotlight
      const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), scene);
      spotLight.diffuse = new Color3(colX, colY, colZ);
      let shadowGenerator = new ShadowGenerator(1024, spotLight);
      shadowGenerator.addShadowCaster(mesh);
      shadowGenerator.useExponentialShadowMap = true;
      return spotLight;
      break;
      case 3: // point light
      const pointLight = new PointLight("pointLight", new Vector3(px, py, pz), scene);
      pointLight.diffuse = new Color3(colX, colY, colZ);
      shadowGenerator = new ShadowGenerator(1024, pointLight);
      shadowGenerator.useExponentialShadowMap = true;
      return pointLight;
      break;
    }
  }
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
  // ---------------------------------------------------

  // ---------------------------------------------------
  // BOTTOM OF CODE - MAIN RENDERING AREA FOR SCENE
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      terrain?: Mesh;
      ground?: Mesh;
      roof?: Mesh;
      skybox?: Mesh;
      clonedHouse?: Mesh;
      trees?: SpriteManager;
      house?: Mesh;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();

    // any further code here
    that.terrain = createTerrain(that.scene);
    that.ground = createGround(that.scene);
    that.skybox = createSkybox(that.scene);
    that.trees = createTrees(that.scene);

    // housing
    //that.box = createBox(that.scene);
    //that.roof = createRoof(that.scene);
    that.house = createHouse(that.scene);
    that.clonedHouse = cloneHouses(that.scene);
    
    

    // scene lighting and camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);

    return that;
  }
