import * as THREE from 'three';
import { MeshLine, MeshLineMaterial} from 'three.meshline';
import * as LerpFunc from '../utils/Lerp.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';


export class OneWayConectionLine
{

  #Points = []
  #width;


  constructor(Points, flowPoints, width, speed)
  {
    if(Points == undefined)
    {
      return;
    }
    else
    {
      this.#Points = Points;
    }
    if(width == undefined)
    {
      this.#width = 0.5;
    }
    else
    {
      this.#width = width;
    }
    if(flowPoints == undefined)
    {
      this.flowPoints = Points;
    }
    else
    {
      this.flowPoints = flowPoints;
    }
    

    const lineGeo = new MeshLine();
  
    var doublePoints = []
    for (let i = 0; i < (this.#Points.length / 3); i++)
    {
      doublePoints.push(this.#Points[(i * 3)]);
      doublePoints.push(this.#Points[(i * 3) + 1]);
      doublePoints.push(this.#Points[(i * 3) + 2]);
  
      if(i != 0 || i != (this.#Points.length / 3) - 1)
      {
        doublePoints.push(this.#Points[(i * 3)]);
        doublePoints.push(this.#Points[(i * 3) + 1]);
        doublePoints.push(this.#Points[(i * 3) + 2]);
      }
    }
  
  
    lineGeo.setPoints(doublePoints);
  
    const lineMat = new MeshLineMaterial({color: 0xa9dff5, lineWidth: this.#width});
    const line = new THREE.Mesh(lineGeo, lineMat);
  
    scene.add(line);
  
  
    for (let i = 1; i < (this.#Points.length / 3) - 1; i++)
    {
      const node = new THREE.Mesh(
        new THREE.CylinderGeometry(this.#width * 3, this.#width * 3, this.#width * 2.8, 12),
        new THREE.MeshStandardMaterial({color: 0x32a852}));//MeshStandardMaterial     MeshToonMaterial
      node.receiveShadow = true;
      node.position.x = this.#Points[(i * 3)];
      node.position.y = this.#Points[(i * 3) + 1];
      node.position.z = this.#Points[(i * 3) + 2];
      scene.add(node);
      
    }


    this.sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.#width * 1.2, 10, 10),
      new THREE.MeshStandardMaterial({color: 0xc451ad})
    );//MeshStandardMaterial     MeshToonMaterial

    scene.add(this.sphereMesh);

    this.sphereMesh.position.set(this.#Points[0], this.#Points[1], this.#Points[2]);
    this.currentSphereIndex = 0;
    if(speed == undefined)
    {
      this.lerpSpeed = THREE.MathUtils.randFloat(0.4, 0.8);
    }
    else
    {
      this.lerpSpeed = speed;
    }
  }

  UpdateSphere()
  {
    var diffx = this.flowPoints[(this.currentSphereIndex * 3) + 3] - this.sphereMesh.position.x;
    var diffy = this.flowPoints[(this.currentSphereIndex * 3) + 4] - this.sphereMesh.position.y;
    var diffz = this.flowPoints[(this.currentSphereIndex * 3) + 5] - this.sphereMesh.position.z;

    var distance = (diffx * diffx) + (diffy * diffy) + (diffz * diffz)
    distance = Math.sqrt(distance);

    if(isNaN(distance))
    {
      this.currentSphereIndex = 0;
      this.sphereMesh.position.set(this.flowPoints[0],
      this.flowPoints[1],
      this.flowPoints[2]);
    }

    diffx = this.flowPoints[((this.currentSphereIndex) * 3)] - this.flowPoints[(this.currentSphereIndex * 3) + 3];
    diffy = this.flowPoints[((this.currentSphereIndex) * 3) + 1] - this.flowPoints[(this.currentSphereIndex * 3) + 4];
    diffz = this.flowPoints[((this.currentSphereIndex) * 3) + 2] - this.flowPoints[(this.currentSphereIndex * 3) + 5];

    diffx = (diffx / Math.abs(diffx)) * this.lerpSpeed;
    diffy = (diffy / Math.abs(diffy)) * this.lerpSpeed;
    diffz = (diffz / Math.abs(diffz)) * this.lerpSpeed;

    if(isNaN(diffx))
    {
      diffx = 0;
    }
    if(isNaN(diffy))
    {
      diffy = 0;
    }
    if(isNaN(diffz))
    {
      diffz = 0;
    }

    if(distance < 0.7)
    {
      this.currentSphereIndex++;
      this.sphereMesh.position.set(this.flowPoints[(this.currentSphereIndex * 3)],
      this.flowPoints[(this.currentSphereIndex * 3) + 1],
      this.flowPoints[(this.currentSphereIndex * 3) + 2]);
    }
    else
    {
      this.sphereMesh.position.x -= diffx;
      this.sphereMesh.position.y -= diffy;
      this.sphereMesh.position.z -= diffz;
    }
  }
}


export class TwoWayConectionLine
{

  #Points = []
  #NodeArray = []
  #width;


  constructor(Points, flowPoints, width, speed, scene)
  {
    var offset = 1.5;
    if(Points == undefined)
    {
      return;
    }
    else
    {
      this.#Points = Points;
    }
    if(width == undefined)
    {
      this.#width = 0.5;
    }
    else
    {
      this.#width = width;
    }
    if(flowPoints == undefined)
    {
      this.flowPoints = Points;
    }
    else
    {
      this.flowPoints = flowPoints;
    }
    
    var leftDoublePoints = []
    this.leftLane = []
    
    for (let i = 0; i < (this.#Points.length / 3); i++)
    {
      leftDoublePoints.push(this.#Points[(i * 3)] - offset);
      leftDoublePoints.push(this.#Points[(i * 3) + 1]);
      leftDoublePoints.push(this.#Points[(i * 3) + 2] + offset);
  
      if(i != 0 || i != (this.#Points.length / 3) - 1)
      {
        leftDoublePoints.push(this.#Points[(i * 3)] - offset);
        leftDoublePoints.push(this.#Points[(i * 3) + 1]);
        leftDoublePoints.push(this.#Points[(i * 3) + 2] + offset);
      }
    }
    var rightDoublePoints = []
    this.rightLane = []

    for (let i = (this.#Points.length / 3) - 1; i >= 0; i--)
    {
      rightDoublePoints.push(this.#Points[(i * 3)] + offset);
      rightDoublePoints.push(this.#Points[(i * 3) + 1]);
      rightDoublePoints.push(this.#Points[(i * 3) + 2] - offset);

      if(i != 0 || i != (this.#Points.length / 3) - 1)
      {
        rightDoublePoints.push(this.#Points[(i * 3)] + offset);
        rightDoublePoints.push(this.#Points[(i * 3) + 1]);
        rightDoublePoints.push(this.#Points[(i * 3) + 2] - offset);
      }
    }

    for (let i = (this.flowPoints.length / 3) - 1; i >= 0; i--)
    {
      this.rightLane.push(this.flowPoints[(i * 3)] + offset);
      this.rightLane.push(this.flowPoints[(i * 3) + 1]);
      this.rightLane.push(this.flowPoints[(i * 3) + 2] - offset);
    }
    for (let i = 0; i < (this.flowPoints.length / 3); i++)
    {
      this.leftLane.push(this.flowPoints[(i * 3)] - offset);
      this.leftLane.push(this.flowPoints[(i * 3) + 1]);
      this.leftLane.push(this.flowPoints[(i * 3) + 2] + offset);
    }
  
    const lineGeo = new MeshLine();
    lineGeo.setPoints(leftDoublePoints);
  
    const lineMat = new MeshLineMaterial({color: 0x425a8f, lineWidth: this.#width});//0x425a8f
    const line = new THREE.Mesh(lineGeo, lineMat);
  
    scene.add(line);

    const lineGeo2 = new MeshLine();
    lineGeo2.setPoints(rightDoublePoints);
    const lineMat2 = new MeshLineMaterial({color: 0x006662, lineWidth: this.#width});//0x31918d   0x51dbd4
    const line2 = new THREE.Mesh(lineGeo2, lineMat2);
  
    scene.add(line2);
  
  
    for (let i = 1; i < (this.#Points.length / 3) - 1; i++)
    {
      const node = new THREE.Mesh(
        new THREE.CylinderGeometry(this.#width * 3, this.#width * 3, this.#width * 2.8, 12),
        new THREE.MeshStandardMaterial({color: 0xf02666}));//MeshStandardMaterial     MeshToonMaterial
      node.receiveShadow = true;
      node.position.x = this.#Points[(i * 3)];
      node.position.y = this.#Points[(i * 3) + 1];
      node.position.z = this.#Points[(i * 3) + 2];
      this.#NodeArray.push(node);
      scene.add(node);
    }


    this.leftShpere = new THREE.Mesh(
      new THREE.SphereGeometry(this.#width * 1.2, 10, 10),
      new THREE.MeshStandardMaterial({color: 0x5182ed})//0x5182ed  0x425a8f
    );//MeshStandardMaterial     MeshToonMaterial

    scene.add(this.leftShpere);
    this.leftShpere.position.set(this.leftLane[0], this.leftLane[1], this.leftLane[2]);

    this.rightShpere = new THREE.Mesh(
      new THREE.SphereGeometry(this.#width * 1.2, 10, 10),
      new THREE.MeshStandardMaterial({color: 0x88fcf7})//0x88fcf7   0x4d9996
    );//MeshStandardMaterial     MeshToonMaterial

    scene.add(this.rightShpere);
    this.rightShpere.position.set(this.rightLane[0], this.rightLane[1], this.rightLane[2]);

    this.currentLeftSphereIndex = 0;
    this.currentRightSphereIndex = 0;
    if(speed == undefined)
    {
      this.lerpSpeed = THREE.MathUtils.randFloat(0.4, 0.8);
    }
    else
    {
      this.lerpSpeed = speed;
    }
  }

  AddToBloomSelection(bloomPass)
  {
    bloomPass.selection.add(this.leftShpere);
    bloomPass.selection.add(this.rightShpere);

    for (let i = 0; i < this.#NodeArray.length; i++)
    {
      bloomPass.selection.add(this.#NodeArray[i]);
    }
  }

  UpdateSphere()
  {
    this.#UpdateLeft();
    this.#UpdateRight()
  }

  #UpdateLeft()
  {
    var diffx = this.leftLane[(this.currentLeftSphereIndex * 3) + 3] - this.leftShpere.position.x;
    var diffy = this.leftLane[(this.currentLeftSphereIndex * 3) + 4] - this.leftShpere.position.y;
    var diffz = this.leftLane[(this.currentLeftSphereIndex * 3) + 5] - this.leftShpere.position.z;

    var distance = (diffx * diffx) + (diffy * diffy) + (diffz * diffz)
    distance = Math.sqrt(distance);

    if(isNaN(distance))
    {
      this.currentLeftSphereIndex = 0;
      this.leftShpere.position.set(this.leftLane[0],
      this.leftLane[1],
      this.leftLane[2]);
    }

    diffx = this.leftLane[((this.currentLeftSphereIndex) * 3)] - this.leftLane[(this.currentLeftSphereIndex * 3) + 3];
    diffy = this.leftLane[((this.currentLeftSphereIndex) * 3) + 1] - this.leftLane[(this.currentLeftSphereIndex * 3) + 4];
    diffz = this.leftLane[((this.currentLeftSphereIndex) * 3) + 2] - this.leftLane[(this.currentLeftSphereIndex * 3) + 5];

    diffx = (diffx / Math.abs(diffx)) * this.lerpSpeed;
    diffy = (diffy / Math.abs(diffy)) * this.lerpSpeed;
    diffz = (diffz / Math.abs(diffz)) * this.lerpSpeed;

    if(isNaN(diffx))
    {
      diffx = 0;
    }
    if(isNaN(diffy))
    {
      diffy = 0;
    }
    if(isNaN(diffz))
    {
      diffz = 0;
    }

    if(distance < 0.7)
    {
      this.currentLeftSphereIndex++;
      this.leftShpere.position.set(this.leftLane[(this.currentLeftSphereIndex * 3)],
      this.leftLane[(this.currentLeftSphereIndex * 3) + 1],
      this.leftLane[(this.currentLeftSphereIndex * 3) + 2]);
    }
    else
    {
      this.leftShpere.position.x -= diffx;
      this.leftShpere.position.y -= diffy;
      this.leftShpere.position.z -= diffz;
    }
  }

  #UpdateRight()
  {
    var diffx = this.rightLane[(this.currentRightSphereIndex * 3) + 3] - this.rightShpere.position.x;
    var diffy = this.rightLane[(this.currentRightSphereIndex * 3) + 4] - this.rightShpere.position.y;
    var diffz = this.rightLane[(this.currentRightSphereIndex * 3) + 5] - this.rightShpere.position.z;

    var distance = (diffx * diffx) + (diffy * diffy) + (diffz * diffz)
    distance = Math.sqrt(distance);

    if(isNaN(distance))
    {
      this.currentRightSphereIndex = 0;
      this.rightShpere.position.set(this.rightLane[0],
      this.rightLane[1],
      this.rightLane[2]);
    }

    diffx = this.rightLane[((this.currentRightSphereIndex) * 3)] - this.rightLane[(this.currentRightSphereIndex * 3) + 3];
    diffy = this.rightLane[((this.currentRightSphereIndex) * 3) + 1] - this.rightLane[(this.currentRightSphereIndex * 3) + 4];
    diffz = this.rightLane[((this.currentRightSphereIndex) * 3) + 2] - this.rightLane[(this.currentRightSphereIndex * 3) + 5];

    diffx = (diffx / Math.abs(diffx)) * this.lerpSpeed;
    diffy = (diffy / Math.abs(diffy)) * this.lerpSpeed;
    diffz = (diffz / Math.abs(diffz)) * this.lerpSpeed;

    if(isNaN(diffx))
    {
      diffx = 0;
    }
    if(isNaN(diffy))
    {
      diffy = 0;
    }
    if(isNaN(diffz))
    {
      diffz = 0;
    }

    if(distance < 0.7)
    {
      this.currentRightSphereIndex++;
      this.rightShpere.position.set(this.rightLane[(this.currentRightSphereIndex * 3)],
      this.rightLane[(this.currentRightSphereIndex * 3) + 1],
      this.rightLane[(this.currentRightSphereIndex * 3) + 2]);
    }
    else
    {
      this.rightShpere.position.x -= diffx;
      this.rightShpere.position.y -= diffy;
      this.rightShpere.position.z -= diffz;
    }
  }
}


export class BuildingTile
{
  #Tile;
  #Body;
  #Roof;
  #isLoaded = false;
  isPopedUp;

  constructor(x, y, z, size, hidden, scene, bloomPass)
  {
    if(x == undefined)
    {
      x = 0;
    }
    if(y == undefined)
    {
      y = 0;
    }
    if(z == undefined)
    {
      z = 0;
    }
    if(size == undefined)
    {
      size = 50;
    }
    if(hidden == undefined)
    {
      hidden = false;
    }
  
    this.#Tile = new THREE.Mesh(
      new THREE.BoxGeometry(size, size / 10, size),
      new THREE.MeshStandardMaterial({color: 0x47a855 })//0xd4ba6e
    );//MeshStandardMaterial    MeshToonMaterial
    this.#Tile.position.x = x;
    this.#Tile.position.y = y;
    this.#Tile.position.z = z;
    scene.add(this.#Tile);


    this.LoadModel(scene, bloomPass);


    if(hidden == true)
    {
      this.Reset();
    }
  }

  async LoadModel(scene, bloomPass)
  {
    const loader = new GLTFLoader();
    const result = await loader.loadAsync('3D_models/IoT/house.gltf');

    let tmep_scene = result.scene;

    this.#Body = tmep_scene.getObjectByName("Body");
    this.#Body.parent.remove(this.#Body);

    this.#Body.position.set(0, 10, 0);
    this.#Body.scale.set(0.01, 0.01, 0.01)
    this.#Body.rotation.y = -90 * THREE.MathUtils.DEG2RAD;
    this.#Tile.add(this.#Body);



    this.#Roof = tmep_scene.getObjectByName("Roof");
    this.#Roof.parent.remove(this.#Roof);

    this.#Body.add(this.#Roof);
    this.#Roof.position.set(0, 2, 0);
    this.#Roof.scale.set(0.01, 0.01, 0.01)

    bloomPass.selection.add(this.#Body);
    bloomPass.selection.add(this.#Roof);
    this.#isLoaded = true;
  }

  get root()
  {
    return this.#Tile;
  }

  Reset()
  {
    if(!this.#isLoaded)
    {
      return;
    }
    this.#Body.position.set(0, 0, 0);
    this.#Body.scale.set(0.01, 0.01, 0.01);

    this.#Roof.position.set(0, 0, 0);
    this.#Roof.scale.set(0.01, 0.01, 0.01);
  }

  AddToBloomSelection(bloomPass)
  {
    bloomPass.selection.add(this.#Tile);
    if(!this.#isLoaded)
    {
      return;
    }
    bloomPass.selection.add(this.#Body);
    
    bloomPass.selection.add(this.#Roof);
  }

  get Body()
  {
    return this.#Body;
  }

  get Roof()
  {
    return this.#Roof;
  }

  PopUp(normilizedTime)
  {
    if(!this.#isLoaded)
    {
      return;
    }
    if(normilizedTime > 1)
    {
      normilizedTime = 1;
    }

    this.#Body.scale.set(normilizedTime * 10, normilizedTime * 10, normilizedTime * 10);
    this.#Roof.scale.set(normilizedTime, normilizedTime, normilizedTime);

    this.#Body.position.y = LerpFunc.lerp(0, 10, normilizedTime)
    this.#Roof.position.y = LerpFunc.lerp(0, 2, normilizedTime)
  }
}