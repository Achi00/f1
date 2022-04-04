import './App.css';
import * as THREE from 'three'
import { useLoader, useFrame, Canvas, useThree, extend } from "@react-three/fiber";
import { Scroll, useScroll, ScrollControls, MeshReflectorMaterial, PerspectiveCamera,CameraShake, useIntersect, OrbitControls, Image  } from "@react-three/drei";
import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import url from "./F1-Trailer.mp4";

const Ground = () => {
  const floorRef = useRef()
  const scroll = useScroll()
  useFrame(() => (floorRef.current.position.z = scroll.offset * 1.5,floorRef.current.rotation.z = scroll.offset * 1.5))
  const { viewport } = useThree()
  return (
    <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} ref={floorRef} scale={(viewport.width / 15)}>
          <planeGeometry args={[10, 20]} />
          <MeshReflectorMaterial
            blur={[100, 100]}
            resolution={2048}
            mixBlur={0.5}
            mixStrength={20}
            roughness={0}
            depthScale={0.8}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#292b2e"
            metalness={2}
          />
        </mesh>
      
    </>
  )
}

function Swarm({ count, mouse }) {
  const mesh = useRef()
  const light = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  const dummy = useMemo(() => new THREE.Object3D(), [])
  // Generate some random positions, speed factors and timings
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])
  // The innards of this hook will run every frame
  useFrame(state => {
    // Makes the light follow the mouse
    light.current.position.set(mouse.current[0] / aspect, -mouse.current[1] / aspect, 0)
    // Run through the randomized data to calculate some movement
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      // There is no sense or reason to any of this, just messing around with trigonometric functions
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      particle.mx += (mouse.current[0] - particle.mx) * 0.01
      particle.my += (mouse.current[1] * -1 - particle.my) * 0.01
      // Update the dummy object
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s / 3, s / 3, s / 3)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      // And apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <dodecahedronBufferGeometry attach="geometry" args={[0.2, 0]} />
        <meshPhongMaterial attach="material" color="#050505" />
      </instancedMesh>
    </>
  )
}

const Video = () => {
  const { viewport } = useThree()
  const videoRef = useRef()
  const scroll = useScroll()
  useFrame(() => (videoRef.current.position.z = scroll.offset * 1.5,videoRef.current.rotation.y = scroll.offset * 1.5))
  
  const [video] = useState(() => {
    const vid = document.createElement("video");
    vid.src = url;
    vid.crossOrigin = "Anonymous";
    vid.loop = true;
    vid.muted = true;
    vid.play();
    return vid;
  });
  return (
    <group scale={(viewport.width / 15)} ref={videoRef}>
      <mesh rotation={[0, 0, 0]} position={[0, 2, -7]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial emissive={"white"} side={THREE.DoubleSide}>
          <videoTexture attach="map" args={[video]} />
          <videoTexture attach="emissiveMap" args={[video]} />
        </meshStandardMaterial>
      </mesh>
    </group>
  );
}

const Car = () => {
  const gltf = useLoader(GLTFLoader, "./scene.gltf");
  const { viewport } = useThree()
  const scroll = useScroll()
  const carRef = useRef()
  useFrame(() => (carRef.current.position.z = scroll.offset * 1.5,carRef.current.rotation.y = scroll.offset * 1.5))
  
  return (
    <group ref={carRef}>
      <primitive object={gltf.scene} scale={(viewport.width / 15)} position={[0, 0.55, 0]}/>
    </group>
  );
};

function Item({ url, scale, ...props }) {
  const visible = useRef(false)
  const ref = useIntersect((isVisible) => (visible.current = isVisible))
  const { height } = useThree((state) => state.viewport)
  useFrame((state, delta) => {
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, visible.current ? 0 : -height / 2 + 1, 4, delta)
    ref.current.material.zoom = THREE.MathUtils.damp(ref.current.material.zoom, visible.current ? 1 : 1.5, 4, delta)
  })
  return (
    <group {...props}>
      <Image ref={ref} scale={scale} url={url} />
    </group>
  )
}


function Items() {
  const { width: w, height: h } = useThree((state) => state.viewport)
  return (
    <Scroll>
      <Item url="/1.jpg" scale={[w / 10, w / 10, 0.5]} position={[-w / 6, 0.3, 0.3]} />
      <Item url="/2.png" scale={[2, w / 10, 0]} position={[w / 5, -0.9, 0.3]} />
      <Item url="/3.jpg" scale={[w / 7, w / 8, 0.5]} position={[-w / 4, -3, -0.3]} />
      <Item url="/4.jpg" scale={[w / 10, w / 8, 0.5]} position={[w / 4, -6, 1]} />
      <Item url="/3.jpg" scale={[w / 10, w / 8, 0.5]} position={[w / 10, -6, -0.2]} />
      <Item url="/2.png" scale={[w / 12, w / 10, 0.5]} position={[-w / 40, -8, 2.5]} />
      <Item url="/3.jpg" scale={[w / 10, w / 5, 1]} position={[-w / 4, -h * 2.6, 0]} />
      <Item url="/1.jpg" scale={[w / 2, w / 2, 1]} position={[w / 4, -h * 3.1, 0]} />
      <Item url="/4.jpg" scale={[w / 2.5, w / 2, 1]} position={[-w / 6, -h * 4.1, 0]} />
    </Scroll>
  )
}

function App() {
  const mouse = useRef([0, 0])
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return (
    <div className="App">
      <Canvas>
        <Suspense fallback={null}>
          <ScrollControls pages={2.2}>
            <Video />
            <PerspectiveCamera makeDefault fov={70} position={[1, 0.5, 4]} rotation={[9.3, 9, 3.1]}>
             <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} castShadow shadow-mapSize={[2048, 2048]} />
             <ambientLight position={[10, 10, 10]} intensity={1}/>
            </PerspectiveCamera>
             <Ground />
             <Car />
             <Items />
             <Scroll html style={{ width: '100%' }}>
        <h1 style={{ position: 'absolute', color: "#4361EE", top: `100vh`, right: '20vw', fontSize: '6vw',letterSpacing: '3px', transform: `translate3d(0,-100%,0)` }}>
         Track:<br />
          Bahrain<br />
          Internacional<br />
          Circuit
        </h1>
        <h1 style={{ position: 'absolute', top: '110vh', left: '10vw', fontSize: '4vw',color: "#059C9F" }}>The circuit first saw life in 2004 when the first ever Formula 1 Grand Prix took place in the country</h1>
        <h1 style={{ position: 'absolute', top: '160vh', width:"25vw", fontSize: '3vw', right: '35vw', color: "#4895EF"}}>Costing approximately $150 million, the entire facility took less than 18 months to build</h1>
        <h1 style={{ position: 'absolute', top: '160vh', width:"25vw", fontSize: '3vw', left: '10vw', color: "#DC2F02" }}>The first piece of ground in the Sakhir desert was broken in October of 2002. It took 18 months to complete the edifice designed by German architect Hermann Tilke.</h1>
        <h1 style={{ position: 'absolute', top: '160vh', width:"25vw", fontSize: '3vw', left: '68vw', color: "#DC2F02" }}>On April 4, 2004 (04/04/04), BIC became the first-ever track in the Middle East to host the FIA Formula One World Championship</h1>
      </Scroll>
          </ScrollControls>
        </Suspense>
          <Swarm count={isMobile ? 5000 : 10000} mouse={mouse} />
          {/* <OrbitControls /> */}
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={1} height={480} />
          {/* <Bloom luminanceThreshold={0} luminanceSmoothing={4} height={500} /> */}
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1} />
        </EffectComposer>
        <CameraShake yawFrequency={0.2} rollFrequency={0.2} pitchFrequency={0.2} />
      </Canvas>
    </div>
  );
}

export default App;
