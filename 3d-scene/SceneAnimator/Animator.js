import * as THREE from 'three'

export class Animator
{
    #scenePosition;
    #sceneRotation;
    #sceneScale;

    #mainScene;

    #rootObject;

    #isLocked = false;

    constructor(scene, position, rotation, scale)
    {
        this.#scenePosition = position;
        this.#sceneRotation = rotation;
        this.#sceneScale = scale;
        this.#mainScene = scene;

        this.#rootObject = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({color: 0x03fc20})
        );
    }

    SetAllProperties()
    {
        this.#rootObject.position.x = this.#scenePosition.x;
        this.#rootObject.position.y = this.#scenePosition.y;
        this.#rootObject.position.z = this.#scenePosition.z;

        this.#rootObject.rotation.x = this.#sceneRotation.x * THREE.MathUtils.DEG2RAD;
        this.#rootObject.rotation.y = this.#sceneRotation.y * THREE.MathUtils.DEG2RAD;
        this.#rootObject.rotation.z = this.#sceneRotation.z * THREE.MathUtils.DEG2RAD;

        this.#rootObject.scale.set(this.#sceneScale, this.#sceneScale, this.#sceneScale);

        this.#mainScene.add(this.#rootObject);
    }

    set rootObject(value)
    {
        this.#rootObject = value;
    }

    get scenePosition()
    {
        return this.#scenePosition;
    }

    get sceneRotation()
    {
        return this.#sceneRotation;
    }

    get sceneScale()
    {
        return this.#sceneScale;
    }

    get rootObject()
    {
        return this.#rootObject;
    }

    get isLocked()
    {
        return this.#isLocked;
    }

    UpdateLoop()
    {
        rootObject.rotation.x += 0.02;
        rootObject.rotation.y += 0.05;
    }

    StartAnimation()
    {
        throw new Error("Method 'StartAnimation()' must be implemented.");
    }

    ResetAnimation()
    {
        throw new Error("Method 'ResetAnimation()' must be implemented.");
    }

    LockAnimation()
    {
        this.#isLocked = true;
    }

    UnlockAnimation()
    {
        this.#isLocked = false;
    }
}