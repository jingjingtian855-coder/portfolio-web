import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { useEffect, useRef } from 'react'
import './CircularGallery.css'

const imageVertex = `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const imageFragment = `
precision highp float;

uniform sampler2D tMap;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform float uBorderRadius;
uniform float uAlpha;
uniform float uFocus;

varying vec2 vUv;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 cardInset = vec2(0.075, 0.065);
  vec2 imageUvSpace = (vUv - cardInset) / (1.0 - cardInset * 2.0);
  float planeAspect = (uPlaneSize.x * (1.0 - cardInset.x * 2.0)) / (uPlaneSize.y * (1.0 - cardInset.y * 2.0));
  float imageAspect = uImageSize.x / uImageSize.y;
  vec2 imageSize = vec2(1.0);
  if (imageAspect > planeAspect) {
    imageSize.y = planeAspect / imageAspect;
  } else {
    imageSize.x = imageAspect / planeAspect;
  }
  vec2 imageOffset = (1.0 - imageSize) * 0.5;
  vec2 uv = (imageUvSpace - imageOffset) / imageSize;
  float insideImageSpace = step(0.0, imageUvSpace.x) * step(0.0, imageUvSpace.y) * step(imageUvSpace.x, 1.0) * step(imageUvSpace.y, 1.0);
  float insideImage = insideImageSpace * step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);

  vec4 color = texture2D(tMap, clamp(uv, 0.0, 1.0));
  vec3 paper = vec3(0.985, 0.98, 0.94);
  vec3 panelColor = mix(paper, color.rgb, insideImage * color.a);
  float edge = roundedBox(vUv - 0.5, vec2(0.5), uBorderRadius);
  float mask = 1.0 - smoothstep(0.0, 0.012, edge);
  float edgeDistance = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float active = smoothstep(0.78, 1.0, uFocus);
  float border = 1.0 - smoothstep(0.008, 0.02, edgeDistance);
  vec3 borderColor = mix(vec3(0.88, 0.86, 0.78), vec3(1.0, 0.88, 0.0), active);
  panelColor = mix(panelColor, borderColor, border * (0.26 + active * 0.74));
  gl_FragColor = vec4(panelColor, mask * uAlpha);
}
`

const textFragment = `
precision highp float;

uniform sampler2D tMap;
uniform float uAlpha;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(tMap, vUv);
  gl_FragColor = vec4(color.rgb, color.a * uAlpha);
}
`

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function wrapIndex(index, length) {
  return ((index % length) + length) % length
}

function makeTextTexture(gl, item, index, color, font) {
  const title = String(item.text || item.common || item.title || item.photo?.text || '').toUpperCase()
  const medium = String(item.binomial || item.medium || item.photo?.by || '').toUpperCase()
  const number = String(index + 1).padStart(2, '0')
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = 1024 * dpr
  canvas.height = 260 * dpr
  context.scale(dpr, dpr)
  context.clearRect(0, 0, 1024, 260)
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.letterSpacing = '1px'

  context.font = '700 38px "Century Gothic", Bahnschrift, sans-serif'
  context.fillStyle = '#b5a000'
  context.fillText(number, 260, 58)

  context.font = font
  context.fillStyle = color
  context.fillText(title, 342, 56, 420)

  context.font = '600 26px "Century Gothic", Bahnschrift, sans-serif'
  context.fillStyle = 'rgba(17, 18, 15, 0.58)'
  context.fillText(medium, 342, 96, 420)

  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return texture
}

class GalleryMedia {
  constructor({ gl, scene, geometry, item, copy, index, total, config }) {
    this.gl = gl
    this.scene = scene
    this.item = item
    this.copy = copy
    this.index = index
    this.total = total
    this.config = config
    this.imageSource = item.image || item.photo?.url
    this.label = item.text || item.common || item.title || item.photo?.text || ''
    this.baseX = (copy * total + index) * config.spacing
    this.alpha = { value: 1 }
    this.focus = { value: 0 }

    this.imageTexture = new Texture(gl, { generateMipmaps: false })
    this.imageProgram = new Program(gl, {
      vertex: imageVertex,
      fragment: imageFragment,
      transparent: true,
      uniforms: {
        tMap: { value: this.imageTexture },
        uImageSize: { value: [1, 1] },
        uPlaneSize: { value: [config.cardWidth, config.cardHeight] },
        uBorderRadius: { value: config.borderRadius },
        uAlpha: this.alpha,
        uFocus: this.focus,
      },
    })

    this.group = new Transform()
    this.group.setParent(scene)

    this.imageMesh = new Mesh(gl, { geometry, program: this.imageProgram })
    this.imageMesh.scale.set(config.cardWidth, config.cardHeight, 1)
    this.imageMesh.setParent(this.group)

    this.textTexture = makeTextTexture(gl, item, index, config.textColor, config.font)
    this.textProgram = new Program(gl, {
      vertex: imageVertex,
      fragment: textFragment,
      transparent: true,
      uniforms: {
        tMap: { value: this.textTexture },
        uAlpha: this.alpha,
      },
    })
    this.textMesh = new Mesh(gl, { geometry, program: this.textProgram })
    this.textMesh.scale.set(config.cardWidth * 1.18, 0.52, 1)
    this.textMesh.position.y = -(config.cardHeight * 0.5 + 0.3)
    this.textMesh.setParent(this.group)

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      this.imageTexture.image = image
      this.imageProgram.uniforms.uImageSize.value = [image.naturalWidth || image.width, image.naturalHeight || image.height]
    }
    image.src = this.imageSource
  }

  update(scroll, totalWidth) {
    let x = this.baseX + scroll
    while (x < -totalWidth * 0.5) x += totalWidth
    while (x > totalWidth * 0.5) x -= totalWidth

    const distance = Math.abs(x)
    const focus = clamp(1 - distance / 5.8, 0, 1)
    const curve = this.config.bend * 0.12
    const sideShift = Math.sign(x) * Math.min(1, distance / 3.8)

    this.group.position.x = x
    this.group.position.y = 0.04 + focus * 0.34
    this.group.position.z = -Math.pow(distance, 1.22) * curve + focus * 0.38
    this.group.rotation.y = -x * this.config.bend * 0.048
    this.group.rotation.z = -sideShift * 0.12
    this.alpha.value = clamp(.2 + focus * .92, .2, 1)
    this.focus.value = focus
    this.distance = distance
  }
}

class GalleryApp {
  constructor(container, props) {
    this.container = container
    this.props = props
    this.items = props.items?.length ? props.items : []
    this.scroll = { current: 0, target: 0, last: 0 }
    this.isDown = false
    this.dragged = false
    this.start = 0
    this.startScroll = 0
    this.activeIndex = -1
    this.raf = 0

    this.config = {
      bend: props.bend ?? 4.25,
      borderRadius: props.borderRadius ?? 0.08,
      scrollEase: props.scrollEase ?? 0.09,
      scrollSpeed: props.scrollSpeed ?? 1.85,
      textColor: props.textColor ?? '#ffffff',
      font: props.font ?? '600 27px Bahnschrift',
      cardWidth: props.cardWidth ?? 2.18,
      cardHeight: props.cardHeight ?? 3.24,
      spacing: props.spacing ?? 2.86,
    }

    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 1.8) })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.container.appendChild(this.gl.canvas)

    this.camera = new Camera(this.gl, { fov: 32 })
    this.camera.position.z = 8.75
    this.scene = new Transform()
    this.geometry = new Plane(this.gl, { widthSegments: 24, heightSegments: 24 })
    this.medias = []
    this.totalWidth = Math.max(1, this.items.length) * this.config.spacing

    this.createMedias()
    this.bind()
    this.resize()
    this.update()
  }

  createMedias() {
    if (!this.items.length) return
    for (let copy = -1; copy <= 1; copy += 1) {
      this.items.forEach((item, index) => {
        this.medias.push(new GalleryMedia({
          gl: this.gl,
          scene: this.scene,
          geometry: this.geometry,
          item,
          copy,
          index,
          total: this.items.length,
          config: this.config,
        }))
      })
    }
  }

  bind() {
    this.onResize = () => this.resize()
    this.onWheel = (event) => {
      if (event.deltaY > 0 && this.activeIndex === this.items.length - 1) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      this.scroll.target -= event.deltaY * 0.0032 * this.config.scrollSpeed
    }
    this.onPointerDown = (event) => {
      this.isDown = true
      this.dragged = false
      this.start = event.clientX
      this.startScroll = this.scroll.target
      this.container.setPointerCapture?.(event.pointerId)
    }
    this.onPointerMove = (event) => {
      if (!this.isDown) return
      const delta = event.clientX - this.start
      if (Math.abs(delta) > 6) this.dragged = true
      this.scroll.target = this.startScroll + delta * 0.013 * this.config.scrollSpeed
    }
    this.onPointerUp = (event) => {
      if (!this.isDown) return
      this.isDown = false
      this.container.releasePointerCapture?.(event.pointerId)
      if (!this.dragged) this.selectNearest()
    }
    this.onKeyDown = (event) => {
      if (event.key === 'ArrowRight') this.scroll.target -= this.config.spacing
      if (event.key === 'ArrowLeft') this.scroll.target += this.config.spacing
      if (event.key === 'Enter') this.selectNearest()
    }

    window.addEventListener('resize', this.onResize)
    this.container.addEventListener('wheel', this.onWheel, { passive: false })
    this.container.addEventListener('pointerdown', this.onPointerDown)
    this.container.addEventListener('pointermove', this.onPointerMove)
    this.container.addEventListener('pointerup', this.onPointerUp)
    this.container.addEventListener('pointercancel', this.onPointerUp)
    this.container.addEventListener('keydown', this.onKeyDown)
  }

  resize() {
    const width = this.container.clientWidth || 1
    const height = this.container.clientHeight || 1
    this.renderer.setSize(width, height)
    this.camera.perspective({ aspect: width / height })
  }

  selectNearest() {
    if (!this.medias.length || typeof this.props.onSelect !== 'function') return
    const nearest = this.medias.reduce((active, media) => (media.distance < active.distance ? media : active), this.medias[0])
    this.props.onSelect(wrapIndex(nearest.index, this.items.length))
  }

  syncActiveIndex() {
    if (!this.medias.length || typeof this.props.onActiveIndexChange !== 'function') return
    const nextMedia = this.medias.reduce((active, media) => (media.distance < active.distance ? media : active), this.medias[0])
    const nextIndex = wrapIndex(nextMedia.index, this.items.length)
    if (nextIndex === this.activeIndex) return
    this.activeIndex = nextIndex
    this.props.onActiveIndexChange(nextIndex)
  }

  update = () => {
    this.scroll.current += (this.scroll.target - this.scroll.current) * this.config.scrollEase
    this.medias.forEach((media) => media.update(this.scroll.current, this.totalWidth))
    this.syncActiveIndex()
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.raf = requestAnimationFrame(this.update)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.container.removeEventListener('wheel', this.onWheel)
    this.container.removeEventListener('pointerdown', this.onPointerDown)
    this.container.removeEventListener('pointermove', this.onPointerMove)
    this.container.removeEventListener('pointerup', this.onPointerUp)
    this.container.removeEventListener('pointercancel', this.onPointerUp)
    this.container.removeEventListener('keydown', this.onKeyDown)
    this.gl.canvas.remove()
  }
}

export default function CircularGallery({
  items,
  bend = 5,
  textColor = '#ffffff',
  borderRadius = 0.08,
  scrollEase = 0.07,
  fontUrl = '',
  font = 'bold 30px Bahnschrift',
  scrollSpeed = 2,
  cardWidth,
  cardHeight,
  spacing,
  onSelect,
  onActiveIndexChange,
}) {
  const containerRef = useRef(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!fontUrl) return undefined
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontUrl
    document.head.appendChild(link)
    return () => link.remove()
  }, [fontUrl])

  useEffect(() => {
    if (!containerRef.current) return undefined
    const app = new GalleryApp(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      scrollEase,
      font,
      scrollSpeed,
      cardWidth,
      cardHeight,
      spacing,
      onSelect: (index) => onSelectRef.current?.(index),
      onActiveIndexChange,
    })
    return () => app.destroy()
  }, [items, bend, textColor, borderRadius, scrollEase, font, scrollSpeed, cardWidth, cardHeight, spacing])

  return <div className="circular-gallery" ref={containerRef} role="button" tabIndex="0" aria-label="Plastic works circular gallery" />
}
