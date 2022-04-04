import * as THREE from 'three'
import { proxy } from 'valtio'

export const damp = THREE.MathUtils.damp
export const state = proxy({
  clicked: null,
  urls: [11, 12, 13, 14, 15, 16, 17, 18, 19, 13, 11, 17, 15, 14, 12, 16, 17, 14, 19, 11].map((u) => `/${u}.jpg`)
})
