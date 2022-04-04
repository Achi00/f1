import * as THREE from 'three'
import React, { useRef, Suspense, useState } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { ContactShadows, Text, Html} from '@react-three/drei'
import img from './mclaren.jpg'
import img1 from './f12022.jpg'
import inner from './inner.png'
import middle from './middle.png'
import outer from './outer.png'
import f1 from './f1Logo.png'
import Fireflies from '../components/Fireflies'
import disp from "./disp.jpg"
import './Home.css'
import "./ImageFadeMaterial"

function Rig() {
  const { camera, mouse } = useThree()
  const vec = new THREE.Vector3()
  return useFrame(() => camera.position.lerp(vec.set(mouse.x * 2.5, mouse.y * 1.5, camera.position.z), 0.02))
}

function FadingImage() {
  const ref = useRef()
  const [texture1, texture2, dispTexture] = useLoader(THREE.TextureLoader, [img, img1, disp])
  const [hovered, setHover] = useState(false)
  useFrame(() => (ref.current.dispFactor = THREE.MathUtils.lerp(ref.current.dispFactor, !!hovered, 0.1)))
  return (
    <mesh onPointerOver={(e) => setHover(true)} onPointerOut={(e) => setHover(false)}>
      <planeGeometry args={[60, 30]} />
      <imageFadeMaterial ref={ref} tex={texture1} tex2={texture2} disp={dispTexture} />
    </mesh>
  )
}

function Image() {
  const texture = useLoader(THREE.TextureLoader, img)
  return (
    <mesh>
      <planeBufferGeometry attach="geometry" args={[60, 30]} />
      <meshBasicMaterial attach="material" map={texture} toneMapped={false} />
    </mesh>
  )
}
function F1() {
  const texture = useLoader(THREE.TextureLoader, f1)
  return (
    <mesh position={[-12, -8, 2]}>
      <planeBufferGeometry attach="geometry" args={[6, 3]} />
      <meshBasicMaterial attach="material" map={texture}/>
    </mesh>
  )
}

function Button() {
  const [hover, setHover] = useState(false);
  const onHover = () => {
    setHover(true);
  };

  const onLeave = () => {
    setHover(false);
  };
  return(
    <>
    <div className='Btn'onMouseEnter={onHover}
    onMouseLeave={onLeave}>

      {hover ? "100Mph, 750KG Of Downforce" : ""}
    </div>
    {/* <div className="text" onMouseEnter={onHover}
    onMouseLeave={onLeave}>
      {hover ? "Text" : ""}
    </div> */}
    <img className='inner-btn' src={inner} alt="Button" />
    <img className='middle-btn' src={middle} alt="Button" />
    <img className='outer-btn' src={outer} alt="Button" />
    </>  
  )
}



function Info() {
  return (
    <>
      <Text font="/Inter-Bold.woff" scale={[10, 9, 1]} position={[-7, -2.5, 1.99]} color="#ffffff" anchorX="center" anchorY="middle">
      F1 Experiences provides you
      </Text>
      <Text font="/Inter-Bold.woff" scale={[4, 4, 1]} position={[-7, -3.5, 1.99]} color="#ffffff" anchorX="right" anchorY="middle">
      with Official F1 Ticket Packages
      </Text>
      <Text scale={[7, 7, 1]} position={[-3.6, -5.5, 5]} color="#ffffff" anchorX="center" anchorY="middle">
        F1 Experience
      </Text>
      <Text scale={[7, 7, 1]} position={[0, -6, 6]} color="#ffffff" anchorX="center" anchorY="middle">
      F1® Experiences Official Packages
      </Text>
    </>
  )
}


function Home() {
  return (
    <div className='App'>
    <Button />
      <Canvas
        concurrent
        gl={{ powerPreference: 'high-performance', antialias: false, stencil: false, depth: false, alpha: false }}
        pixelRatio={1.25}
        camera={{ position: [0, 0, 15], near: 5, far: 40 }}>
        <color attach="background" args={['white']} />
        <ambientLight intensity={0.8} />
        <directionalLight castShadow position={[2.5, 12, 12]} intensity={4} />
        <pointLight position={[20, 20, 20]} />
        <pointLight position={[-20, -20, -20]} intensity={5} />
        <Suspense fallback={null}>
          <Info />
          <FadingImage scale={1}/>          
          <F1 />
          <Fireflies count={900}/>
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0} luminanceSmoothing={4} height={500} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
        <Rig />
      </Canvas>
    </div>
  )
}

export default Home