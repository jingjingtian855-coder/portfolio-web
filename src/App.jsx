import { Fragment, useEffect, useRef, useState } from 'react'
import CircularGallery from './CircularGallery'
import ClickSpark from './ClickSpark'
import Lanyard from './Lanyard'
import TextType from './TextType'

const menuItems = [
  {
    id: '01',
    title: 'ABOUT ME',
    subtitle: 'Profile & biography',
    href: '#about',
    image: '/images/content-about-v2.jpg',
  },
  {
    id: '02',
    title: 'DESIGN WORKS',
    subtitle: 'Visual design & narrative',
    href: '#design-works',
    image: '/images/content-design-v2.jpg',
  },
  {
    id: '03',
    title: 'PLASTIC WORKS',
    subtitle: 'Sculpture & drawing',
    href: '#plastic-works',
    image: '/images/content-sculpture-v2.jpg',
  },
  {
    id: '04',
    title: 'DIGITAL WORKS',
    subtitle: 'Image, particles & motion',
    href: '#digital-works',
    image: '/images/content-digital-v3.png',
  },
]

const designBookPages = [
  '/images/design-book-01.jpg',
  '/images/design-book-02.webp',
  '/images/design-book-03.webp',
  '/images/design-book-04.jpg',
  '/images/design-book-05.jpg',
]

const plasticWorks = [
  { image: '/images/plastic-work-01.jpg', title: 'PLASTER STUDY', medium: 'Pencil on paper' },
  { image: '/images/plastic-work-02.jpg', title: 'SEATED FIGURE', medium: 'Pencil on paper' },
  { image: '/images/plastic-work-03.jpg', title: 'PORTRAIT STUDY I', medium: 'Pencil on paper' },
  { image: '/images/plastic-work-04.jpg', title: 'OBJECTS & LIGHT', medium: 'Pencil on paper' },
  { image: '/images/plastic-work-05.jpg', title: 'THE WORKER', medium: 'Oil on canvas' },
  { image: '/images/plastic-work-06.jpg', title: 'PORTRAIT STUDY II', medium: 'Pencil on paper' },
  { image: '/images/plastic-work-07.jpg', title: 'WATERSIDE', medium: 'Oil on canvas' },
  { image: '/images/plastic-work-08.jpg', title: 'SEATED PORTRAIT', medium: 'Pencil on paper' },
  { image: '/images/plastic-work-09.jpg', title: 'TREES IN SHADOW', medium: 'Charcoal on paper' },
  { image: '/images/plastic-work-10.jpg', title: 'INTERIOR', medium: 'Oil on canvas' },
]

const digitalWorks = [
  {
    id: '01',
    title: 'LIGHT TIDE FIELD',
    type: 'TouchDesigner / particle terrain',
    cover: '/images/digital/light-tide-field-cover.jpg',
    video: '/videos/digital/light-tide-field.mp4',
    source: 'New screen recording / particle mountain field',
    meta: 'Full-screen particle landscape / responsive color flow',
  },
  {
    id: '02',
    title: 'PINK LILY',
    type: 'TouchDesigner / flower particle system',
    cover: '/images/digital/pink-lily-new-cover.jpg',
    video: '/videos/digital/pink-lily-new.mp4',
    source: 'New mobile export / pink lily particle sequence',
    meta: 'Bloom cutout / particle drift / black-stage loop',
  },
  {
    id: '03',
    title: 'JUDGE: RECURSIVE JUDGMENT',
    type: 'AI SHORT FILM',
    cover: '/images/digital/metahuman-trailer-cover.jpg',
    video: '/videos/digital/metahuman-trailer.mp4',
    source: 'New trailer / Unreal Engine narrative sequence',
    meta: 'Virtual judge / cinematic interface / final trailer',
  },
]

const desktopAlbumCovers = Array.from(
  { length: 64 },
  (_, index) => `/images/desktop-album-library/album-${String(index + 1).padStart(3, '0')}.webp`,
)

const desktopApps = [
  { label: 'FIGMA', image: '/images/desktop-cutouts/figma.png', x: '68.25%', y: '31.69%', iconClass: 'desktop-icon-figma' },
  { label: 'PHOTOSHOP', image: '/images/desktop-cutouts/photoshop.png', x: '59.66%', y: '45.31%' },
  { label: 'ILLUSTRATOR', image: '/images/desktop-cutouts/illustrator.png', x: '39.17%', y: '81.55%' },
  { label: 'INDESIGN', image: '/images/desktop-cutouts/indesign.png', x: '68.61%', y: '44.67%' },
  { label: 'PROCESSING', image: '/images/desktop-cutouts/processing.png', x: '60.10%', y: '30.87%', iconClass: 'desktop-icon-processing' },
  { label: 'UNREAL', image: '/images/desktop-cutouts/unreal.png', x: '62.79%', y: '22.00%' },
  { label: 'TOUCHDESIGNER', image: '/images/desktop-cutouts/touchdesigner.png', x: '46.48%', y: '76.04%', iconClass: 'desktop-icon-touchdesigner' },
  { label: 'MESHLAB', image: '/images/desktop-cutouts/eye.png', x: '45.68%', y: '63.95%' },
  { label: 'WORD', image: '/images/desktop-cutouts/word-app.png', x: '35.43%', y: '26.39%' },
  { label: 'EXCEL', image: '/images/desktop-cutouts/excel.png', x: '54.06%', y: '73.53%' },
  { label: 'POWERPOINT', image: '/images/desktop-cutouts/powerpoint.png', x: '59.64%', y: '79.76%' },
]

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>
}

function DesktopItem({
  image,
  label,
  x,
  y,
  className = '',
  iconClass = '',
  children,
}) {
  const itemRef = useRef(null)
  const drag = useRef({ x: 0, y: 0, active: false })

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.target.closest('.desktop-popover')) return
    const item = itemRef.current
    if (!item) return

    const bounds = item.getBoundingClientRect()
    const fieldBounds = item.parentElement.getBoundingClientRect()
    drag.current = {
      ...drag.current,
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startBounds: bounds,
      fieldBounds,
      baseX: drag.current.x,
      baseY: drag.current.y,
    }
    item.setPointerCapture(event.pointerId)
    item.classList.add('is-dragging')
    event.preventDefault()
  }

  const handlePointerMove = (event) => {
    const item = itemRef.current
    const state = drag.current
    if (!item || !state.active || state.pointerId !== event.pointerId) return

    const rawX = event.clientX - state.startX
    const rawY = event.clientY - state.startY
    const deltaX = Math.max(state.fieldBounds.left - state.startBounds.left, Math.min(rawX, state.fieldBounds.right - state.startBounds.right))
    const deltaY = Math.max(state.fieldBounds.top - state.startBounds.top, Math.min(rawY, state.fieldBounds.bottom - state.startBounds.bottom))
    drag.current.x = state.baseX + deltaX
    drag.current.y = state.baseY + deltaY
    item.style.setProperty('--drag-x', `${drag.current.x.toFixed(1)}px`)
    item.style.setProperty('--drag-y', `${drag.current.y.toFixed(1)}px`)
  }

  const finishDrag = (event) => {
    const item = itemRef.current
    if (!item || !drag.current.active || drag.current.pointerId !== event.pointerId) return
    drag.current.active = false
    item.classList.remove('is-dragging')
    if (item.hasPointerCapture(event.pointerId)) item.releasePointerCapture(event.pointerId)
  }

  return (
    <div
      ref={itemRef}
      className={`desktop-item ${className}`.trim()}
      style={{ '--desktop-x': x, '--desktop-y': y }}
      tabIndex="0"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <span className={`desktop-icon-shell ${iconClass}`.trim()}>
        <img src={image} alt="" draggable="false" />
      </span>
      <span className="desktop-item-label">{label}</span>
      {children && <div className="desktop-popover">{children}</div>}
    </div>
  )
}

function PortfolioTail() {
  const tailRef = useRef(null)
  const markRef = useRef(null)

  const handlePointerMove = (event) => {
    const tail = tailRef.current
    const mark = markRef.current
    if (!tail || !mark) return

    const bounds = tail.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))

    tail.style.setProperty('--tail-x', `${(x * 100).toFixed(1)}%`)
    tail.style.setProperty('--tail-y', `${(y * 100).toFixed(1)}%`)
    mark.style.setProperty('--mark-x', `${((x - .5) * 18).toFixed(2)}px`)
    mark.style.setProperty('--mark-y', `${((y - .5) * 12).toFixed(2)}px`)
  }

  const resetPointer = () => {
    const tail = tailRef.current
    const mark = markRef.current
    tail?.style.setProperty('--tail-x', '24%')
    tail?.style.setProperty('--tail-y', '16%')
    mark?.style.setProperty('--mark-x', '0px')
    mark?.style.setProperty('--mark-y', '0px')
  }

  return (
    <section
      className="portfolio-tail"
      id="contact"
      ref={tailRef}
      data-page-scene
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="page-transition-sweep page-transition-sweep-dark" aria-hidden="true" />
      <div className="tail-beams" aria-hidden="true" />
      <a className="tail-menu-button" href="#menu">
        <span>CONTENTS</span>
        <b>+</b>
      </a>

      <h2 className="tail-mark" ref={markRef} data-reveal>Bev.</h2>

      <p className="tail-statement" data-reveal>
        Turning observation into<br />
        <strong>visible form.</strong>
      </p>

      <div className="tail-columns" data-reveal>
        <div>
          <span>PRACTICE</span>
          <a href="#menu">Visual Design</a>
          <a href="#menu">Image Making</a>
          <a href="#menu">Form Studies</a>
          <a href="#menu">Digital Experiments</a>
        </div>
        <div>
          <span>QUICK LINKS</span>
          <a href="#home">Home</a>
          <a href="#menu">Contents</a>
          <a href="#about">About Me</a>
          <a href="#contact">Contact</a>
        </div>
        <div>
          <span>CONTACT</span>
          <p>Beijing, China</p>
          <a href="mailto:jingjingtian855@gmail.com">jingjingtian855@gmail.com</a>
          <p>Open to new ideas<br />and creative exchange.</p>
        </div>
        <div>
          <span>STATUS</span>
          <p>Portfolio 2021—2026</p>
          <p>Visual design<br />image & form</p>
        </div>
      </div>

      <div className="tail-bottom">
        <span>© 2026 BEVERLY BRENNAN</span>
        <span>PORTFOLIO / 2021—2026</span>
        <a href="#home">BACK TO TOP ↑</a>
      </div>
    </section>
  )
}

function App() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [introStage, setIntroStage] = useState('loading')
  const [heroScene, setHeroScene] = useState('construction')
  const [isTapeReady, setIsTapeReady] = useState(false)
  const [peelOffset, setPeelOffset] = useState({ x: 0, y: 0 })
  const [isPeeling, setIsPeeling] = useState(false)
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })
  const [isMapDragging, setIsMapDragging] = useState(false)
  const [plasticCurrentIndex, setPlasticCurrentIndex] = useState(0)
  const [selectedPlasticWork, setSelectedPlasticWork] = useState(null)
  const [selectedDigitalWork, setSelectedDigitalWork] = useState(null)
  const [isLanyardComplete, setIsLanyardComplete] = useState(false)
  const scrollProgressRef = useRef(null)
  const lightboxWheelRef = useRef(0)
  const lanyardTouchStartRef = useRef(null)
  const dragState = useRef(null)
  const returnDragState = useRef(null)
  const revealTimer = useRef(null)
  const tapeMessage = 'I am Beverly Brennan · Welcome to my website'

  const openPlasticWork = (index) => {
    const normalizedIndex = (index + plasticWorks.length) % plasticWorks.length
    setSelectedPlasticWork({ ...plasticWorks[normalizedIndex], index: normalizedIndex })
  }

  const shiftPlasticWork = (direction) => {
    setSelectedPlasticWork((current) => {
      if (!current) return current
      const nextIndex = (current.index + direction + plasticWorks.length) % plasticWorks.length
      return { ...plasticWorks[nextIndex], index: nextIndex }
    })
  }

  const openDigitalWork = (work, index) => {
    setSelectedDigitalWork({ ...work, index })
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      setIntroStage('done')
      return undefined
    }

    document.body.classList.add('intro-locked')
    const startedAt = performance.now()
    const duration = 1350
    let animationFrame
    let leaveTimer
    let finishTimer

    const charge = (now) => {
      const elapsed = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 2.2)
      setLoadingProgress(Math.min(100, Math.floor(eased * 100)))

      if (elapsed < 1) {
        animationFrame = window.requestAnimationFrame(charge)
        return
      }

      setLoadingProgress(100)
      leaveTimer = window.setTimeout(() => setIntroStage('leaving'), 180)
      finishTimer = window.setTimeout(() => {
        setIntroStage('done')
        document.body.classList.remove('intro-locked')
      }, 760)
    }

    animationFrame = window.requestAnimationFrame(charge)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(leaveTimer)
      window.clearTimeout(finishTimer)
      document.body.classList.remove('intro-locked')
    }
  }, [])

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.hasAttribute('data-scroll-reveal')) {
            entry.target.classList.toggle('is-visible', entry.isIntersecting)
            return
          }

          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.14 },
    )

    revealItems.forEach((item) => observer.observe(item))

    let targetScrollY = window.scrollY
    let smoothScrollY = targetScrollY
    let scrollFrame = null

    const clamp01 = (value) => Math.max(0, Math.min(1, value))
    const smoothstep = (value) => {
      const clamped = clamp01(value)
      return clamped * clamped * (3 - 2 * clamped)
    }
    const lerp = (from, to, progress) => from + (to - from) * progress
    const easePaper = (value) => {
      const clamped = clamp01(value)
      return 1 - Math.pow(1 - clamped, 4)
    }
    const getVirtualTop = (element, scrollY) => {
      return element.getBoundingClientRect().top + (window.scrollY - scrollY)
    }

    const updateProgress = (scrollY = window.scrollY) => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.transform = `scaleX(${height > 0 ? scrollY / height : 0})`
      }

      const viewportHeight = window.innerHeight
      document.querySelectorAll('[data-page-scene]').forEach((scene) => {
        const sceneTop = getVirtualTop(scene, scrollY)
        const sceneHeight = Math.max(viewportHeight, scene.offsetHeight || viewportHeight)
        const entryRaw = clamp01((viewportHeight - sceneTop) / viewportHeight)
        const exitStart = Math.max(0, sceneHeight - viewportHeight)
        const exitRaw = clamp01((-sceneTop - exitStart) / viewportHeight)
        const entryEase = easePaper(entryRaw)
        const exitEase = easePaper(exitRaw)
        const pageY = exitRaw > 0
          ? lerp(0, -20, exitEase)
          : lerp(100, 0, entryEase)
        const mediaScale = lerp(1.08, 1, entryEase)
        const mediaClipVertical = lerp(12, 0, entryEase)
        const mediaClipHorizontal = lerp(8, 0, entryEase)
        const titleProgress = clamp01((entryRaw - .35) / .4)
        const titleEase = easePaper(titleProgress)
        const titleY = lerp(40, 0, titleEase)
        const brightness = lerp(.75, 1, entryEase)
        const enter = clamp01((viewportHeight - sceneTop) / (viewportHeight * .72))
        const exit = clamp01(-sceneTop / (viewportHeight * .72))
        const opacity = Math.max(.12, enter * (1 - exit * .58))
        const translateY = (1 - enter) * 76 - exit * 46
        const blur = (1 - enter) * 11 + exit * 7
        const scale = .972 + enter * .028 - exit * .012

        scene.style.setProperty('--scene-enter', enter.toFixed(3))
        scene.style.setProperty('--scene-exit', exit.toFixed(3))
        scene.style.setProperty('--scene-opacity', opacity.toFixed(3))
        scene.style.setProperty('--scene-y', `${translateY.toFixed(2)}px`)
        scene.style.setProperty('--scene-blur', `${blur.toFixed(2)}px`)
        scene.style.setProperty('--scene-scale', scale.toFixed(4))
        scene.style.setProperty('--scene-clip', `${((1 - enter) * 100).toFixed(2)}%`)
        scene.style.setProperty('--scene-sweep-y', `${(-enter * 112).toFixed(2)}%`)
        scene.style.setProperty('--scene-page-y', `${pageY.toFixed(2)}vh`)
        scene.style.setProperty('--scene-media-scale', mediaScale.toFixed(4))
        scene.style.setProperty('--scene-media-clip-v', `${mediaClipVertical.toFixed(2)}%`)
        scene.style.setProperty('--scene-media-clip-h', `${mediaClipHorizontal.toFixed(2)}%`)
        scene.style.setProperty('--scene-title-opacity', titleProgress.toFixed(3))
        scene.style.setProperty('--scene-title-y', `${titleY.toFixed(2)}px`)
        scene.style.setProperty('--scene-brightness', brightness.toFixed(3))
        scene.style.setProperty('--scene-paper-shadow', `${(1 - entryEase) * 28 + exitEase * 18}px`)

        if (scene.classList.contains('portfolio-tail')) {
          scene.style.setProperty('--scene-page-y', '0vh')
          scene.style.setProperty('--scene-y', '0px')
          scene.style.setProperty('--scene-blur', '0px')
          scene.style.setProperty('--scene-title-y', '0px')
          scene.querySelectorAll('.tail-columns > div').forEach((group, index) => {
            const delay = index * .08
            const localEnter = Math.max(0, Math.min(1, (enter - delay) / Math.max(.01, 1 - delay)))
            const localExit = Math.max(0, Math.min(1, (exit - delay) / Math.max(.01, 1 - delay)))
            const opacity = Math.max(.06, localEnter * (1 - localExit * .9))
            const y = (1 - localEnter) * 38
            const x = (1 - localEnter) * (index % 2 === 0 ? -28 : 28) + localExit * (index % 2 === 0 ? 22 : -22)
            group.style.setProperty('--tail-group-opacity', opacity.toFixed(3))
            group.style.setProperty('--tail-group-x', `${x.toFixed(2)}px`)
            group.style.setProperty('--tail-group-y', `${y.toFixed(2)}px`)
            group.style.setProperty('--tail-group-blur', '0px')
          })
        }
      })

      const aboutSection = document.querySelector('#about')
      if (aboutSection) {
        const aboutTop = getVirtualTop(aboutSection, scrollY)
        const aboutTravel = Math.max(1, aboutSection.offsetHeight - viewportHeight)
        const aboutProgress = clamp01(-aboutTop / aboutTravel)
        const lanyardIntro = 1 - smoothstep((aboutProgress - .18) / .34)
        const desktopReveal = smoothstep((aboutProgress - .16) / .34)
        aboutSection.classList.toggle('is-lanyard-active', !aboutSection.classList.contains('is-lanyard-complete') && lanyardIntro > .55)
        aboutSection.style.setProperty('--about-progress', aboutProgress.toFixed(3))
        aboutSection.style.setProperty('--about-lanyard-intro', lanyardIntro.toFixed(3))
        aboutSection.style.setProperty('--about-desktop-reveal', desktopReveal.toFixed(3))
        aboutSection.style.setProperty('--sun-arc-offset', (-aboutProgress * 84).toFixed(2))
        aboutSection.style.setProperty('--sun-model-turn', `${(-8 + aboutProgress * 16).toFixed(2)}deg`)
        aboutSection.style.setProperty('--media-scroll-x', `${(-aboutProgress * 48).toFixed(2)}%`)
        aboutSection.style.setProperty('--desktop-drift-x', `${(-9 + aboutProgress * 18).toFixed(2)}px`)

        aboutSection.querySelectorAll('.desktop-horizontal-browser').forEach((browser) => {
          const track = browser.firstElementChild
          if (!track) return
          const travel = Math.max(0, track.scrollWidth - browser.clientWidth)
          if (browser.classList.contains('desktop-album-browser')) {
            const pageCount = Math.max(1, track.children.length)
            const maxPage = pageCount - 1
            const page = Math.round(aboutProgress * maxPage)
            const pageStep = maxPage > 0 ? travel / maxPage : 0
            track.style.setProperty('--browser-x', `${(-pageStep * page).toFixed(2)}px`)
            return
          }

          if (browser.classList.contains('desktop-book-browser')) {
            const page = Math.round(aboutProgress)
            track.style.setProperty('--browser-x', `${(-travel * page).toFixed(2)}px`)
            return
          }

          track.style.setProperty('--browser-x', `${(-travel * aboutProgress).toFixed(2)}px`)
        })
      }

      const menuSection = document.querySelector('#menu')
      const menuImages = document.querySelectorAll('.menu-card-image')
      if (menuSection && menuImages.length) {
        const menuTop = getVirtualTop(menuSection, scrollY)
        const travel = Math.max(280, window.innerHeight * .5)
        const exitProgress = clamp01(-menuTop / travel)
        const delayedProgress = clamp01((exitProgress - .38) / .62)

        menuImages.forEach((image) => {
          image.style.setProperty('--dissolve-progress', delayedProgress.toFixed(3))
          image.style.setProperty('--edge-start', `${(100 - delayedProgress * 42).toFixed(1)}%`)
        })
      }

      const graphicSection = document.querySelector('#design-works')
      const graphicTrack = graphicSection?.querySelector('.graphic-chapter-track')
      if (graphicSection && graphicTrack) {
        const trackWidth = graphicTrack.scrollWidth
        const horizontalTravel = Math.max(0, trackWidth - window.innerWidth)
        const sectionHeight = viewportHeight + horizontalTravel
        graphicSection.style.height = `${sectionHeight}px`

        const graphicTop = getVirtualTop(graphicSection, scrollY)
        const horizontalProgress = horizontalTravel > 0
          ? clamp01(-graphicTop / horizontalTravel)
          : 0
        const graphicEnter = smoothstep((viewportHeight - graphicTop) / (viewportHeight * .82))
        const graphicExit = smoothstep(-graphicTop / Math.max(1, viewportHeight * .85))

        graphicTrack.style.setProperty('--graphic-x', `${(-horizontalTravel * horizontalProgress).toFixed(2)}px`)
        graphicSection.style.setProperty('--graphic-progress', horizontalProgress.toFixed(3))
        graphicSection.style.setProperty('--graphic-enter', graphicEnter.toFixed(3))
        graphicSection.style.setProperty('--graphic-exit', graphicExit.toFixed(3))
        graphicSection.style.setProperty('--graphic-enter-x', `${((-1 + graphicEnter) * 54).toFixed(2)}vw`)
        graphicSection.style.setProperty('--graphic-enter-y', `${((1 - graphicEnter) * 5).toFixed(2)}vh`)
        graphicSection.style.setProperty('--graphic-enter-rotate', `${((1 - graphicEnter) * -4.5).toFixed(2)}deg`)
        graphicSection.style.setProperty('--graphic-enter-scale', (.94 + graphicEnter * .06 - graphicExit * .015).toFixed(4))
        graphicSection.style.setProperty('--graphic-enter-opacity', Math.max(.2, graphicEnter * (1 - graphicExit * .18)).toFixed(3))
      }

      const bookSection = document.querySelector('#design-book')
      const bookPages = bookSection?.querySelectorAll('.design-book-page')
      if (bookSection && bookPages?.length) {
        const pageCount = bookPages.length
        const turnCount = Math.max(1, pageCount - 1)
        const bookTravel = viewportHeight * turnCount * 1.06
        bookSection.style.height = `${viewportHeight + bookTravel}px`

        const bookTop = getVirtualTop(bookSection, scrollY)
        const bookProgress = bookTravel > 0
          ? clamp01(-bookTop / bookTravel)
          : 0
        const bookEnter = smoothstep((viewportHeight - bookTop) / (viewportHeight * .78))
        const bookExit = smoothstep(-bookTop / Math.max(1, viewportHeight * .9))
        const pageProgress = bookProgress * turnCount
        const currentPage = Math.min(pageCount, Math.floor(pageProgress + .58) + 1)

        bookSection.style.setProperty('--book-progress', bookProgress.toFixed(3))
        bookSection.style.setProperty('--book-enter', bookEnter.toFixed(3))
        bookSection.style.setProperty('--book-exit', bookExit.toFixed(3))
        bookSection.style.setProperty('--book-drop-y', `${((1 - bookEnter) * -46).toFixed(2)}vh`)
        bookSection.style.setProperty('--book-drop-rotate', `${((1 - bookEnter) * -4.8).toFixed(2)}deg`)
        bookSection.style.setProperty('--book-drop-scale', (.88 + bookEnter * .12 - bookExit * .018).toFixed(4))
        bookSection.style.setProperty('--book-drop-opacity', Math.max(.16, bookEnter).toFixed(3))
        bookSection.querySelector('.design-book-current')?.replaceChildren(String(currentPage).padStart(2, '0'))

        const activeIndex = Math.min(pageCount - 1, Math.floor(pageProgress))
        const activeTurn = clamp01(pageProgress - activeIndex)
        const hasTurningPage = activeIndex < pageCount - 1
        const baseIndex = hasTurningPage ? activeIndex + 1 : activeIndex
        const stackDepth = Math.min(turnCount, pageProgress)

        bookSection.style.setProperty('--book-stack-width', `${(7 + stackDepth * 1.8).toFixed(2)}px`)
        bookSection.style.setProperty('--book-stack-opacity', (.36 + clamp01(stackDepth / 2.2) * .28).toFixed(3))

        bookPages.forEach((page, index) => {
          const isActiveTurn = hasTurningPage && index === activeIndex
          const isBasePage = index === baseIndex
          const isPastPage = index < activeIndex
          const turn = isActiveTurn ? activeTurn : 0
          const easedTurn = turn < 1 ? 1 - Math.pow(1 - turn, 2.35) : 1
          const fold = Math.sin(Math.PI * turn)
          const pageBend = Math.sin(Math.PI * clamp01((turn - .05) / .9))
          const visible = isActiveTurn || isBasePage
          const zIndex = isActiveTurn
            ? pageCount * 8
            : isBasePage
              ? pageCount * 4
              : isPastPage
                ? index
                : 0
          page.style.zIndex = String(zIndex)
          page.style.setProperty('--book-angle', `${(isActiveTurn ? -92 * easedTurn : 0).toFixed(2)}deg`)
          page.style.setProperty('--book-fold', fold.toFixed(3))
          page.style.setProperty('--book-bend', pageBend.toFixed(3))
          page.style.setProperty('--book-page-opacity', visible ? '1' : '0')
          page.style.setProperty('--book-front-dim', (.012 + fold * .14 + turn * .035).toFixed(3))
          page.style.setProperty('--book-edge-light', (.08 + fold * .26).toFixed(3))
          page.style.setProperty('--book-stack-dark', (fold * .045).toFixed(3))
          page.style.setProperty('--book-shadow-opacity', (isActiveTurn ? .05 + fold * .24 : .045).toFixed(3))
          page.style.setProperty('--book-shadow-x', `${(14 + fold * 38).toFixed(2)}px`)
          page.style.setProperty('--book-shadow-y', `${(17 + fold * 12).toFixed(2)}px`)
          page.style.setProperty('--book-shadow-blur', `${(24 + fold * 36).toFixed(2)}px`)
        })
      }

      const plasticSection = document.querySelector('#plastic-works')
      if (plasticSection) {
        const plasticTravel = viewportHeight * 2.9
        plasticSection.style.height = `${viewportHeight + plasticTravel}px`

        const plasticTop = getVirtualTop(plasticSection, scrollY)
        const plasticProgress = clamp01(-plasticTop / plasticTravel)
        const plasticEnter = smoothstep((viewportHeight - plasticTop) / (viewportHeight * .82))
        const plasticExit = smoothstep(-plasticTop / Math.max(1, viewportHeight * .9))

        plasticSection.style.setProperty('--plastic-progress', plasticProgress.toFixed(3))
        plasticSection.style.setProperty('--plastic-enter', plasticEnter.toFixed(3))
        plasticSection.style.setProperty('--plastic-enter-opacity', Math.max(.18, plasticEnter * (1 - plasticExit * .24)).toFixed(3))
      }

      const digitalSection = document.querySelector('#digital-works')
      const digitalCards = digitalSection?.querySelectorAll('.digital-work-card')
      if (digitalSection && digitalCards?.length) {
        const digitalTravel = Math.max(1, digitalSection.offsetHeight - viewportHeight)
        const digitalProgress = clamp01(-getVirtualTop(digitalSection, scrollY) / digitalTravel)
        const sceneCount = digitalCards.length
        const scenePosition = digitalProgress * sceneCount
        const isTailHandoff = digitalProgress > .985
        const activeIndex = Math.min(digitalCards.length - 1, Math.floor(scenePosition))
        const localProgress = isTailHandoff ? 1 : clamp01(scenePosition - activeIndex)
        const introProgress = clamp01(digitalProgress / .18)
        const expoProgress = localProgress === 1 ? 1 : 1 - Math.pow(2, -10 * localProgress)
        const panelProgress = 1 - Math.pow(1 - localProgress, 3)
        const titleProgress = clamp01((localProgress - .22) / .45)
        const clipProgress = clamp01((expoProgress - .18) / .82)
        const panelY = isTailHandoff ? 0 : lerp(62, 0, panelProgress)
        const cardWidth = lerp(52, 92, expoProgress)
        const cardHeight = lerp(30, 74, expoProgress)
        const cardY = lerp(40, 0, expoProgress)
        const cardScale = lerp(.88, 1, expoProgress)
        const cardOpacity = isTailHandoff ? 0 : clamp01((expoProgress - .08) / .32)
        const visibleTitleProgress = isTailHandoff ? 0 : titleProgress
        const logoY = lerp(0, -18, clamp01(localProgress * 1.35))

        digitalSection.style.setProperty('--digital-progress', digitalProgress.toFixed(3))
        digitalSection.style.setProperty('--digital-current', String(Math.min(activeIndex + 1, digitalCards.length)).padStart(2, '0'))
        digitalSection.style.setProperty('--digital-intro-opacity', (1 - clamp01((digitalProgress - .08) / .18)).toFixed(3))
        digitalSection.style.setProperty('--digital-hero-logo-y', `${logoY.toFixed(2)}vh`)
        digitalSection.style.setProperty('--digital-panel-y', `${panelY.toFixed(2)}vh`)
        digitalSection.style.setProperty('--digital-card-width', `${cardWidth.toFixed(2)}vw`)
        digitalSection.style.setProperty('--digital-card-height', `${cardHeight.toFixed(2)}vh`)
        digitalSection.style.setProperty('--digital-card-y', `${cardY.toFixed(2)}vh`)
        digitalSection.style.setProperty('--digital-card-scale', cardScale.toFixed(4))
        digitalSection.style.setProperty('--digital-card-opacity', cardOpacity.toFixed(3))
        digitalSection.style.setProperty('--digital-card-clip', `${lerp(16, 0, clipProgress).toFixed(2)}% ${lerp(10, 0, clipProgress).toFixed(2)}%`)
        digitalSection.style.setProperty('--digital-title-opacity', visibleTitleProgress.toFixed(3))
        digitalSection.style.setProperty('--digital-title-y', `${lerp(26, 0, visibleTitleProgress).toFixed(2)}px`)
        digitalSection.style.setProperty('--digital-bg-dim', (.64 - Math.min(digitalProgress, .75) * .2).toFixed(3))
        digitalSection.style.setProperty('--digital-scroll-hint-opacity', (introProgress * (1 - clamp01((digitalProgress - .2) / .12))).toFixed(3))

        digitalCards.forEach((card, index) => {
          const isActive = !isTailHandoff && index === activeIndex
          const isPast = isTailHandoff || index < activeIndex
          card.style.setProperty('--digital-card-layer-y', isActive ? '0vh' : isPast ? '-18vh' : '64vh')
          card.style.setProperty('--digital-card-layer-scale', isActive ? '1' : isPast ? '.96' : '.9')
          card.style.setProperty('--digital-card-layer-opacity', isActive ? '1' : isPast ? '0' : '.001')
          card.classList.toggle('is-active', isActive)
          card.classList.toggle('is-past', isPast)
        })
      }
    }

    const animateScroll = () => {
      const distance = targetScrollY - smoothScrollY
      smoothScrollY += distance * (Math.abs(distance) > window.innerHeight ? .22 : .14)

      if (Math.abs(distance) < .08) {
        smoothScrollY = targetScrollY
      }

      updateProgress(smoothScrollY)

      if (Math.abs(targetScrollY - smoothScrollY) > .08) {
        scrollFrame = window.requestAnimationFrame(animateScroll)
        return
      }

      scrollFrame = null
    }

    const requestScrollFrame = () => {
      targetScrollY = window.scrollY
      if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(animateScroll)
    }

    const handleResize = () => {
      targetScrollY = window.scrollY
      smoothScrollY = targetScrollY
      updateProgress(smoothScrollY)
    }

    updateProgress(smoothScrollY)
    window.addEventListener('scroll', requestScrollFrame, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', requestScrollFrame)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  useEffect(() => {
    if (!selectedPlasticWork) return undefined

    document.body.classList.add('lightbox-open')
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedPlasticWork(null)
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        shiftPlasticWork(1)
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        shiftPlasticWork(-1)
      }
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.classList.remove('lightbox-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedPlasticWork])

  useEffect(() => {
    if (!selectedDigitalWork) return undefined

    document.body.classList.add('lightbox-open')
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedDigitalWork(null)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.classList.remove('lightbox-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedDigitalWork])

  useEffect(() => {
    const getLanyardLockTop = (deltaY) => {
      if (isLanyardComplete || deltaY <= 0) return null

      const aboutSection = document.querySelector('#about')
      if (!aboutSection) return null

      const viewportHeight = window.innerHeight
      const aboutTop = aboutSection.offsetTop
      const aboutBottom = aboutTop + Math.max(1, aboutSection.offsetHeight - viewportHeight)
      const currentY = window.scrollY
      const nextY = currentY + deltaY

      if (nextY < aboutTop || currentY >= aboutBottom) return null
      return aboutTop
    }

    const lockAtLanyard = (deltaY, event) => {
      const targetY = getLanyardLockTop(deltaY)
      if (targetY === null) return false

      event.preventDefault()
      window.scrollTo({ top: targetY, behavior: 'auto' })
      return true
    }

    const handleWheel = (event) => {
      lockAtLanyard(event.deltaY, event)
    }

    const handleTouchStart = (event) => {
      lanyardTouchStartRef.current = event.touches[0]?.clientY ?? null
    }

    const handleTouchMove = (event) => {
      if (lanyardTouchStartRef.current === null) return

      const currentY = event.touches[0]?.clientY
      if (typeof currentY !== 'number') return

      const deltaY = lanyardTouchStartRef.current - currentY
      lockAtLanyard(deltaY, event)
      lanyardTouchStartRef.current = currentY
    }

    const handleTouchEnd = () => {
      lanyardTouchStartRef.current = null
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return

      const downwardKeys = ['ArrowDown', 'PageDown', ' ', 'End']
      if (!downwardKeys.includes(event.key) || (event.key === ' ' && event.shiftKey)) return

      const viewportDelta = event.key === 'End'
        ? document.documentElement.scrollHeight
        : event.key === 'ArrowDown' ? 90 : window.innerHeight
      lockAtLanyard(viewportDelta, event)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      lanyardTouchStartRef.current = null
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLanyardComplete])

  const completePeel = () => {
    if (heroScene !== 'construction') return

    dragState.current = null
    setIsPeeling(false)
    setPeelOffset({ x: window.innerWidth * 0.72, y: -window.innerHeight * 0.62 })
    setHeroScene('dissolving')

    revealTimer.current = window.setTimeout(() => setHeroScene('map'), 900)
  }

  const handlePeelStart = (event) => {
    if (heroScene !== 'construction' || !isTapeReady) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = { x: event.clientX, y: event.clientY }
    setIsPeeling(true)
  }

  const handlePeelMove = (event) => {
    if (!dragState.current || heroScene !== 'construction') return

    const x = event.clientX - dragState.current.x
    const y = event.clientY - dragState.current.y
    setPeelOffset({ x, y })

    if (Math.hypot(x, y) > 220 && (x > 70 || y < -70)) completePeel()
  }

  const handlePeelEnd = (event) => {
    if (!dragState.current) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    dragState.current = null
    setIsPeeling(false)
    setPeelOffset({ x: 0, y: 0 })
  }

  const handlePeelKey = (event) => {
    if (!isTapeReady) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      completePeel()
    }
  }

  const showConstruction = () => {
    window.clearTimeout(revealTimer.current)
    dragState.current = null
    returnDragState.current = null
    setIsPeeling(false)
    setIsMapDragging(false)
    setPeelOffset({ x: 0, y: 0 })
    setMapOffset({ x: 0, y: 0 })
    setHeroScene('construction')
  }

  const completeReturn = () => {
    if (heroScene !== 'map') return

    returnDragState.current = null
    setIsMapDragging(false)
    setPeelOffset({ x: 0, y: 0 })
    setMapOffset({ x: -window.innerWidth * 0.34, y: window.innerHeight * 0.28 })
    setHeroScene('restoring')

    revealTimer.current = window.setTimeout(() => {
      setMapOffset({ x: 0, y: 0 })
      setHeroScene('construction')
    }, 820)
  }

  const handleMapStart = (event) => {
    if (heroScene !== 'map' || event.target.closest('a')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    returnDragState.current = { x: event.clientX, y: event.clientY }
    setIsMapDragging(true)
  }

  const handleMapMove = (event) => {
    if (!returnDragState.current || heroScene !== 'map') return

    const x = event.clientX - returnDragState.current.x
    const y = event.clientY - returnDragState.current.y
    setMapOffset({ x, y })

    if (Math.hypot(x, y) > 220 && (x < -70 || y > 70)) completeReturn()
  }

  const handleMapEnd = (event) => {
    if (!returnDragState.current) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    returnDragState.current = null
    setIsMapDragging(false)
    setMapOffset({ x: 0, y: 0 })
  }

  const handleMapKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      completeReturn()
    }
  }

  const handlePlasticPointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    event.currentTarget.style.setProperty('--plastic-light-x', `${(50 + x * 18).toFixed(2)}%`)
    event.currentTarget.style.setProperty('--plastic-light-y', `${(44 + y * 12).toFixed(2)}%`)
  }

  const resetPlasticPointer = (event) => {
    event.currentTarget.style.setProperty('--plastic-light-x', '50%')
    event.currentTarget.style.setProperty('--plastic-light-y', '44%')
  }

  const handleDigitalPointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    const pointerX = x * 42
    const pointerY = y * 28
    event.currentTarget.style.setProperty('--digital-pointer-x', `${pointerX.toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-pointer-y', `${pointerY.toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-grid-x', `${(pointerX * -.18).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-grid-y', `${(pointerY * -.18).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-core-x', `${(pointerX * .45).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-core-y', `${(pointerY * .45).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-card-pointer-x', `${(pointerX * .28).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-card-pointer-y', `${(pointerY * .18).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-orbit-b-x', `${(pointerX * -.6).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-orbit-b-y', `${(pointerY * .4).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-orbit-c-x', `${(pointerX * .2).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-orbit-c-y', `${(pointerY * -.4).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--digital-tilt-x', `${(-y * 7).toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--digital-tilt-y', `${(x * 9).toFixed(2)}deg`)
  }

  const resetDigitalPointer = (event) => {
    event.currentTarget.style.setProperty('--digital-pointer-x', '0px')
    event.currentTarget.style.setProperty('--digital-pointer-y', '0px')
    event.currentTarget.style.setProperty('--digital-grid-x', '0px')
    event.currentTarget.style.setProperty('--digital-grid-y', '0px')
    event.currentTarget.style.setProperty('--digital-core-x', '0px')
    event.currentTarget.style.setProperty('--digital-core-y', '0px')
    event.currentTarget.style.setProperty('--digital-card-pointer-x', '0px')
    event.currentTarget.style.setProperty('--digital-card-pointer-y', '0px')
    event.currentTarget.style.setProperty('--digital-orbit-b-x', '0px')
    event.currentTarget.style.setProperty('--digital-orbit-b-y', '0px')
    event.currentTarget.style.setProperty('--digital-orbit-c-x', '0px')
    event.currentTarget.style.setProperty('--digital-orbit-c-y', '0px')
    event.currentTarget.style.setProperty('--digital-tilt-x', '0deg')
    event.currentTarget.style.setProperty('--digital-tilt-y', '0deg')
  }

  const handleLanyardComplete = () => {
    const aboutSection = document.querySelector('#about')
    if (!aboutSection) return

    setIsLanyardComplete(true)

    const viewportHeight = window.innerHeight
    const aboutTravel = Math.max(1, aboutSection.offsetHeight - viewportHeight)
    const targetProgress = window.innerWidth < 900 ? .34 : .54
    window.scrollTo({
      top: aboutSection.offsetTop + aboutTravel * targetProgress,
      behavior: 'smooth',
    })
  }

  return (
    <ClickSpark
      sparkColor="#639aff"
      sparkSize={27}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <main>
      <div ref={scrollProgressRef} className="scroll-progress" />

      {introStage !== 'done' && (
        <div
          className={`intro-screen ${introStage === 'leaving' ? 'is-leaving' : ''}`}
          aria-live="polite"
          aria-label={`Loading ${loadingProgress} percent`}
        >
          <span className="intro-digit">
            {String(loadingProgress).padStart(3, '0')}<small>%</small>
          </span>
        </div>
      )}

      <section
        className={`hero hero-editorial hero-interactive hero-scene-${heroScene} ${introStage === 'done' ? 'hero-ready' : ''}`}
        id="home"
      >
        <header className="nav hero-nav shell">
          <a className="wordmark hero-wordmark" href="#home" aria-label="返回首页" onClick={showConstruction}>
            Beverly Brennan<span>®</span>
          </a>
          <nav aria-label="主导航">
            <a href="#home" onClick={showConstruction}>HOME</a>
            <a href="#about">ABOUT ME</a>
            <a href="#design-works">DESIGN WORKS</a>
            <a href="#plastic-works">PLASTIC WORKS</a>
            <a href="#digital-works">DIGITAL WORKS</a>
          </nav>
        </header>

        <div
          className={`final-map-layer ${isMapDragging ? 'is-dragging' : ''}`}
          style={{
            '--map-x': `${mapOffset.x}px`,
            '--map-y': `${mapOffset.y}px`,
            '--map-rotate': `${Math.max(-8, Math.min(8, mapOffset.x / 80))}deg`,
          }}
          role="button"
          tabIndex={heroScene === 'map' ? 0 : -1}
          aria-label="向左下拖动返回胶带页面"
          aria-hidden={heroScene !== 'map'}
          onPointerDown={handleMapStart}
          onPointerMove={handleMapMove}
          onPointerUp={handleMapEnd}
          onPointerCancel={handleMapEnd}
          onKeyDown={handleMapKey}
        >
          <div className="final-map-heading">
            <strong>04 / PORTFOLIO</strong>
          </div>
          <img src="/images/hero-map-pattern.webp" alt="作品集四个章节的流程图" draggable="false" />
          <span className="map-return-instruction">DRAG DOWN LEFT TO RETURN</span>
          <a className="final-map-arrow" href="#menu" aria-label="前往目录页">
            <Arrow />
          </a>
        </div>

        <div className="construction-layer" aria-hidden={heroScene === 'map'}>
          <div className="construction-card">
            <div className="construction-meta">
              <strong>PORTFOLIO</strong>
              <span>VISUAL DESIGN / BEIJING</span>
              <span>PORTFOLIO 2021—2026</span>
            </div>

            <div className="construction-message">
              <TextType
                as="span"
                text="I am"
                typingSpeed={115}
                initialDelay={220}
                loop={false}
                showCursor={false}
                variableSpeedEnabled
                variableSpeedMin={70}
                variableSpeedMax={125}
              />
              <TextType
                as="strong"
                text="Beverly Brennan"
                typingSpeed={92}
                initialDelay={760}
                loop={false}
                showCursor={false}
                variableSpeedEnabled
                variableSpeedMin={55}
                variableSpeedMax={115}
              />
              <TextType
                as="span"
                text="Welcome to my website"
                typingSpeed={88}
                initialDelay={2100}
                loop={false}
                showCursor
                cursorCharacter="_"
                deletingSpeed={30}
                pauseDuration={1100}
                variableSpeedEnabled
                variableSpeedMin={55}
                variableSpeedMax={120}
                cursorBlinkDuration={0.5}
                onSentenceComplete={() => setIsTapeReady(true)}
              />
            </div>

            <p className={`peel-instruction ${isTapeReady ? 'is-tape-ready' : ''}`}>DRAG THE TAPE UP ...</p>

            <div
              className={`tape-cluster ${isTapeReady ? 'is-tape-ready' : ''} ${isPeeling ? 'is-dragging' : ''}`}
              style={{
                '--peel-x': `${peelOffset.x}px`,
                '--peel-y': `${peelOffset.y}px`,
                '--peel-rotate': `${Math.max(-14, Math.min(18, peelOffset.x / 24))}deg`,
              }}
              role="button"
              tabIndex={heroScene === 'construction' && isTapeReady ? 0 : -1}
              aria-label="拖动撕开胶带进入作品集"
              onPointerDown={handlePeelStart}
              onPointerMove={handlePeelMove}
              onPointerUp={handlePeelEnd}
              onPointerCancel={handlePeelEnd}
              onKeyDown={handlePeelKey}
            >
              {[1, 2, 3, 4].map((tape) => (
                <Fragment key={tape}>
                  <div className={`tape-shadow tape-shadow-${tape}`} aria-hidden="true" />
                  <div className={`tape-strip tape-strip-${tape}`}>
                    <div className="tape-copy">
                      <span>{tapeMessage}</span>
                      <span>{tapeMessage}</span>
                      <span>{tapeMessage}</span>
                    </div>
                  </div>
                </Fragment>
              ))}
              <span className="peel-handle">PEEL <Arrow diagonal /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="menu-section page-scroll-scene" id="menu" data-page-scene>
        <div className="page-transition-sweep" aria-hidden="true" />
        <div className="shell">
          <header className="menu-nav">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="Contents navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>

          <div className="menu-top" data-reveal data-scroll-reveal>
            <h2>CONTENTS</h2>
            <p>
              Four chapters form this portfolio. Select a direction to enter,
              or keep scrolling to browse the complete story.
            </p>
          </div>

          <div className="menu-grid">
            {menuItems.map((item) => (
              <a className="menu-card" href={item.href} key={item.id} data-reveal data-scroll-reveal>
                <span className="menu-card-index">{item.id}</span>
                <div className="menu-card-image" style={{ '--menu-image': `url("${item.image}")` }}>
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="about-profile about-profile-legacy" id="about-legacy" aria-hidden="true">
        <div className="page-transition-sweep page-transition-sweep-paper" aria-hidden="true" />
        <div className="shell">
          <header className="menu-nav about-nav">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="About navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>

          <div className="about-profile-grid">
            <div className="about-profile-title">
              <span>01 / PERSONAL PROFILE</span>
              <h2>ABOUT<br />ME</h2>
              <p>Visual design, image making<br />and digital experiments.</p>
            </div>

            <div className="about-profile-copy">
              <div className="about-name-row">
                <p>田京京</p>
                <span>Beverly Brennan</span>
              </div>
              <h3>中国传媒大学<br /><em>在读</em></h3>
              <p className="about-profile-intro">
                我关注视觉叙事、图像与形态之间的关系，喜欢把日常观察与生活经验，
                转化为克制但有张力的视觉表达。
              </p>

              <div className="about-interests">
                <span className="about-interests-label">INTERESTS / 悬停查看</span>
                <div className="about-interest-list">
                  <span className="about-interest about-interest-rock" tabIndex="0">
                    摇滚
                    <img src="/images/about-rock.png" alt="两把贝斯与琴包" />
                  </span>
                  <span className="about-interest about-interest-cycling" tabIndex="0">
                    骑行
                    <img src="/images/about-cycling.png" alt="公路自行车" />
                  </span>
                  <span className="about-interest about-interest-calligraphy" tabIndex="0">
                    书法
                    <img src="/images/about-calligraphy.png" alt="书法作品" />
                  </span>
                </div>
              </div>
            </div>

            <div className="about-portrait-block">
              <div className="about-portrait-frame">
                <img src="/images/content-about-v2.jpg" alt="田京京个人照片" />
              </div>
              <div className="about-profile-details">
                <span>BASED IN</span><strong>BEIJING, CHINA</strong>
                <span>CONTACT</span><a href="mailto:jingjingtian855@gmail.com">jingjingtian855@gmail.com</a>
                <span>STATUS</span><strong>STUDENT / DESIGNER</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-profile about-modern about-modern-legacy" id="about-modern-legacy" aria-hidden="true">
        <div className="about-modern-sticky">
          <div className="about-modern-background" aria-hidden="true" />

          <header className="menu-nav about-modern-nav shell">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="About navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>

          <div className="about-modern-layout shell">
            <div className="about-modern-copy">
              <span className="about-modern-kicker">01 / PERSONAL PROFILE</span>
              <h2>ABOUT<br /><em>ME</em></h2>
              <p className="about-modern-name">田京京 <span>/ Beverly Brennan</span></p>
              <p className="about-modern-intro">
                目前就读于中国传媒大学。我关注视觉叙事、图像与形态之间的关系，
                将日常观察转化为克制但有张力的设计表达。
              </p>
              <div className="about-modern-meta">
                <span>BASED IN</span><strong>BEIJING, CHINA</strong>
                <span>STATUS</span><strong>STUDENT / DESIGNER</strong>
                <span>CONTACT</span><a href="mailto:jingjingtian855@gmail.com">jingjingtian855@gmail.com</a>
              </div>
            </div>

            <figure className="about-modern-avatar">
              <img src="/images/about-avatar-pixel.png" alt="田京京的卡通人物形象" draggable="false" />
              <span className="avatar-eye avatar-eye-left" aria-hidden="true"><i /></span>
              <span className="avatar-eye avatar-eye-right" aria-hidden="true"><i /></span>
              <figcaption><span>SCROLL</span><b>WINK → LOOK AROUND</b></figcaption>
            </figure>

            <aside className="about-modern-side">
              <div className="about-modern-school">
                <img src="/images/about-school-logo.webp" alt="中国传媒大学校徽" />
                <p><strong>Communication University of China</strong><span>Currently studying</span></p>
              </div>

              <div className="about-modern-logos" aria-label="Platforms and contact">
                <a href="https://open.spotify.com/" target="_blank" rel="noreferrer" aria-label="Spotify">
                  <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><path d="M17 24c11-3 24-2 33 3M19 33c10-2 20-1 29 3M21 41c8-1 16 0 23 3" /></svg>
                  <span>SPOTIFY</span>
                </a>
                <span className="about-books-logo" aria-label="Apple Books">
                  <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 14c10 0 18 3 24 9v31c-6-6-14-9-24-9V14Zm48 0c-10 0-18 3-24 9v31c6-6 14-9 24-9V14Z" /></svg>
                  <span>BOOKS</span>
                </span>
                <a href="mailto:jingjingtian855@gmail.com" aria-label="Email">
                  <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 14h50v36H7V14Zm2 3 23 19 23-19" /></svg>
                  <span>MAIL</span>
                </a>
              </div>

              <div className="about-modern-interests">
                <p>INTERESTS / HOVER TO EXPLORE</p>
                <div>
                  <span className="about-modern-interest" tabIndex="0">
                    <b>ROCK</b><small>01</small>
                    <img src="/images/about-rock.png" alt="贝斯与摇滚乐器" />
                  </span>
                  <span className="about-modern-interest" tabIndex="0">
                    <b>CYCLING</b><small>02</small>
                    <img src="/images/about-cycling.png" alt="公路自行车" />
                  </span>
                  <span className="about-modern-interest" tabIndex="0">
                    <b>CALLIGRAPHY</b><small>03</small>
                    <img src="/images/about-calligraphy.png" alt="书法作品" />
                  </span>
                </div>
              </div>
            </aside>
          </div>

          <div className="about-modern-progress" aria-hidden="true"><span /></div>
        </div>
      </section>

      <section className={`desktop-about ${isLanyardComplete ? 'is-lanyard-complete' : ''}`} id="about" data-page-scene>
        <div className="desktop-about-sticky">
          <div className="desktop-model-scene" aria-hidden="true">
            <div className="desktop-sky-atmosphere" />
            <div className="desktop-glow-field" />
            <div className="desktop-sun-sweep" />
            <div className="desktop-sun-stage">
              <div className="desktop-sun-disc" />
              <svg className="desktop-sun-orbit" viewBox="0 0 600 320" preserveAspectRatio="none">
                <defs>
                  <filter id="sunArcBlur" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="12" />
                  </filter>
                </defs>
                <path className="desktop-sun-orbit-glow" d="M20 300 A280 280 0 0 1 580 300" pathLength="100" />
                <path className="desktop-sun-orbit-beam" d="M20 300 A280 280 0 0 1 580 300" pathLength="100" />
                <path className="desktop-sun-orbit-trace" d="M20 300 A280 280 0 0 1 580 300" pathLength="100" />
              </svg>
            </div>
            <div className="desktop-horizon-haze" />
          </div>

          <div className="about-lanyard-intro" aria-label="Interactive Beverly Brennan lanyard">
            <div className="about-lanyard-copy" aria-hidden="true">
              <span>01 / PERSONAL PROFILE</span>
              <strong>PULL THE ID</strong>
            </div>
            <Lanyard
              position={[0, 0, 24]}
              gravity={[0, -40, 0]}
              frontImage="/images/lanyard-logo-b.png"
              backImage="/images/lanyard-logo-b.png"
              imageFit="contain"
              lanyardWidth={1}
              onPullComplete={handleLanyardComplete}
            />
          </div>

          <header className="menu-nav desktop-about-nav shell">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="About navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>
          <p className="desktop-hover-hint">Hover icons for info / drag to move</p>

          <div className="desktop-icon-field">
            <DesktopItem
              image="/images/desktop-cutouts/word.png"
              label="ABOUT_ME.docx"
              x="14.83%"
              y="32.30%"
              className="desktop-item-about"
              iconClass="desktop-icon-doc"
            >
              <span className="desktop-popover-kicker">FILE / 01</span>
              <div className="desktop-about-card desktop-about-card-clean">
                <img src="/images/desktop-cutouts/about-avatar.png" alt="" />
                <div>
                  <h3>Beverly Brennan<br /><small>Tian Jingjing</small></h3>
                  <p>CUC student. Visual design, image experiments and interaction are my current focus.</p>
                  <p>Rock / cycling / calligraphy.</p>
                </div>
              </div>
            </DesktopItem>

            <DesktopItem
              image="/images/desktop-cutouts/folder.png"
              label="hobby_rock"
              x="9.07%"
              y="70.89%"
              className="desktop-item-interest"
              iconClass="desktop-icon-folder"
            >
              <img className="desktop-interest-preview" src="/images/about-rock.png" alt="贝斯与摇滚乐器" />
            </DesktopItem>

            <DesktopItem
              image="/images/desktop-cutouts/folder.png"
              label="hobby_cycling"
              x="20.47%"
              y="61.59%"
              className="desktop-item-interest"
              iconClass="desktop-icon-folder"
            >
              <img className="desktop-interest-preview" src="/images/about-cycling.png" alt="公路自行车" />
            </DesktopItem>

            <DesktopItem
              image="/images/desktop-cutouts/word.png"
              label="hobby_calligraphy"
              x="31.75%"
              y="46.32%"
              className="desktop-item-interest"
              iconClass="desktop-icon-doc"
            >
              <img className="desktop-interest-preview desktop-interest-ink" src="/images/about-calligraphy.png" alt="书法作品" />
            </DesktopItem>

            <DesktopItem
              image="/images/desktop-cutouts/spotify.png"
              label="SPOTIFY.app"
              x="89.73%"
              y="23.39%"
              className="desktop-item-right desktop-item-wide"
              iconClass="desktop-icon-spotify"
            >
              <div className="desktop-album-browser desktop-horizontal-browser" aria-label="个人 Spotify 专辑收藏">
                <div className="desktop-album-track">
                  {Array.from({ length: Math.ceil(desktopAlbumCovers.length / 9) }, (_, pageIndex) => (
                    <div className="desktop-album-page" key={`album-page-${pageIndex}`}>
                      {desktopAlbumCovers.slice(pageIndex * 9, pageIndex * 9 + 9).map((cover) => (
                        <img key={cover} src={cover} alt="" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </DesktopItem>

            <DesktopItem
              image="/images/desktop-cutouts/books.png"
              label="BOOKS.app"
              x="90.40%"
              y="48.10%"
              className="desktop-item-right desktop-item-wide"
              iconClass="desktop-icon-books"
            >
              <div className="desktop-book-browser desktop-horizontal-browser" aria-label="横向浏览书单">
                <div className="desktop-book-track">
                  {Array.from({ length: 5 }, (_, index) => (
                    <img
                      className="desktop-book-cover"
                      key={`book-${index + 1}`}
                      src={`/images/desktop-books-cropped/book-${String(index + 1).padStart(2, '0')}.webp`}
                      alt=""
                    />
                  ))}
                </div>
              </div>
            </DesktopItem>

            <DesktopItem
              image="/images/desktop-cutouts/school.png"
              label="CUC_ID.png"
              x="90.58%"
              y="75.46%"
              className="desktop-item-right"
              iconClass="desktop-icon-school"
            >
              <span className="desktop-popover-kicker">EDUCATION / CURRENT</span>
              <h3>Communication University of China</h3>
              <p>Communication University of China<br />Currently studying / Beijing</p>
            </DesktopItem>

            {desktopApps.map((app) => (
              <DesktopItem
                key={app.label}
                image={app.image}
                label={app.label}
                x={app.x}
                y={app.y}
                className="desktop-item-app"
                iconClass={app.iconClass ?? ''}
              />
            ))}
          </div>

        </div>
      </section>

      <section className="graphic-chapter" id="design-works" data-page-scene>
        <div className="graphic-chapter-sticky">
          <div className="graphic-chapter-track">
            <img
              src="/images/design-works-spread.webp"
              alt="平面作品章节：虚实交汇，本真共在"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="design-book" id="design-book" data-page-scene>
        <div className="design-book-sticky">
          <header className="menu-nav design-book-nav shell">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="Design works navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>

          <div className="design-book-meta">
            <span>02 / DESIGN WORKS</span>
            <span><b className="design-book-current">01</b> / {String(designBookPages.length).padStart(2, '0')}</span>
          </div>

          <div className="design-book-stage">
            <div className="design-book-pages">
              {designBookPages.map((page, index) => (
                <figure
                  className="design-book-page"
                  key={page}
                  style={{ zIndex: designBookPages.length - index }}
                >
                  <span className="design-book-page-shadow" aria-hidden="true" />
                  <span className="design-book-page-face design-book-page-front">
                    <img
                      src={page}
                      alt={`平面作品展示第 ${index + 1} 页`}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      draggable="false"
                    />
                  </span>
                  <span className="design-book-page-face design-book-page-back" aria-hidden="true" />
                  <span className="design-book-page-edge" aria-hidden="true" />
                </figure>
              ))}
            </div>
            <div className="design-book-spine" aria-hidden="true" />
          </div>

          <p className="design-book-hint">SCROLL TO TURN THE PAGES</p>
        </div>
      </section>

      <section
        className="plastic-cylinder-section"
        id="plastic-works"
        data-page-scene
        onPointerMove={handlePlasticPointerMove}
        onPointerLeave={resetPlasticPointer}
      >
        <div className="plastic-cylinder-sticky">
          <div className="plastic-room-background" aria-hidden="true" />

          <header className="menu-nav plastic-cylinder-nav shell">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="Plastic works navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>

          <div className="plastic-cylinder-meta">
            <div>
              <span>03 / PLASTIC WORKS</span>
              <h2>FORM<br />STUDIES</h2>
            </div>
            <p><b className="plastic-cylinder-current">{String(plasticCurrentIndex + 1).padStart(2, '0')}</b> / {String(plasticWorks.length).padStart(2, '0')}</p>
          </div>

          <div className="plastic-cylinder-viewport plastic-gallery-stage">
            <CircularGallery
              items={plasticWorks}
              bend={3.2}
              scrollEase={0.09}
              scrollSpeed={1.65}
              textColor="#11120f"
              cardWidth={2.15}
              cardHeight={3.32}
              spacing={2.9}
              font="600 26px 'Century Gothic'"
              onSelect={openPlasticWork}
              onActiveIndexChange={setPlasticCurrentIndex}
            />
          </div>

          <p className="plastic-cylinder-hint">SCROLL TO ROTATE / MOVE TO SHIFT VIEW</p>
        </div>
      </section>

      {selectedPlasticWork && (
        <div
          className="plastic-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPlasticWork.title} full image`}
          onWheel={(event) => {
            event.preventDefault()
            event.stopPropagation()
            const now = performance.now()
            if (Math.abs(event.deltaY) < 8 || now - lightboxWheelRef.current < 280) return
            lightboxWheelRef.current = now
            shiftPlasticWork(event.deltaY > 0 ? 1 : -1)
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPlasticWork(null)
          }}
        >
          <button
            className="plastic-lightbox-close"
            type="button"
            aria-label="Close full image"
            onClick={() => setSelectedPlasticWork(null)}
          >
            CLOSE <span aria-hidden="true">×</span>
          </button>
          <figure className="plastic-lightbox-content">
            <img src={selectedPlasticWork.image} alt={selectedPlasticWork.title} />
            <figcaption>
              <span>{String(selectedPlasticWork.index + 1).padStart(2, '0')}</span>
              <strong>{selectedPlasticWork.title}</strong>
              <small>{selectedPlasticWork.medium}</small>
            </figcaption>
          </figure>
        </div>
      )}

      <section
        className="digital-works-section"
        id="digital-works"
        data-page-scene
        onPointerMove={handleDigitalPointerMove}
        onPointerLeave={resetDigitalPointer}
      >
        <div className="digital-works-sticky">
          <div className="digital-background-layer" aria-hidden="true">
            {digitalWorks.map((work, index) => (
              <video
                className="digital-bg-video"
                key={`bg-${work.id}`}
                src={work.video}
                autoPlay
                muted
                loop
                playsInline
                preload={index === 0 ? 'auto' : 'metadata'}
                style={{ '--digital-bg-index': index }}
              />
            ))}
            <div className="digital-bg-tint" />
          </div>

          <div className="digital-fixed-layer" aria-hidden="true">
            <span className="digital-fixed-link digital-fixed-link-left">CONTACTS</span>
            <span className="digital-fixed-link digital-fixed-link-right">MENU</span>
            <span className="digital-hero-logo">DIGITAL</span>
          </div>

          <header className="menu-nav digital-works-nav shell">
            <a className="wordmark hero-wordmark" href="#home" aria-label="Back to home">
              Beverly Brennan<span>&reg;</span>
            </a>
            <nav aria-label="Digital works navigation">
              <a href="#home">HOME</a>
              <a href="#about">ABOUT ME</a>
              <a href="#design-works">DESIGN WORKS</a>
              <a href="#plastic-works">PLASTIC WORKS</a>
              <a href="#digital-works">DIGITAL WORKS</a>
            </nav>
          </header>

          <div className="digital-story-shell shell">
            <div className="digital-stage-panel" aria-hidden="true" />

            <div className="digital-project-number">
              <span>{String(digitalWorks.length).padStart(2, '0')}</span>
              <b>PROJECTS</b>
            </div>

            <div className="digital-project-stage" aria-label="Digital works showcase">
              {digitalWorks.map((work, index) => (
                <article
                  className="digital-work-card"
                  key={work.id}
                  style={{
                    '--digital-work-index': index,
                  }}
                >
                  <button
                    className="digital-card-media"
                    type="button"
                    aria-label={`Play ${work.title} from the beginning`}
                    onClick={() => openDigitalWork(work, index)}
                  >
                    <video
                      src={work.video}
                      poster={work.cover}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                    />
                    <span className="digital-video-open" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>

            <div className="digital-project-title">
              <span>04 / DIGITAL WORKS</span>
              {digitalWorks.map((work, index) => (
                <div
                  className="digital-title-item"
                  key={`title-${work.id}`}
                  style={{ '--digital-work-index': index }}
                >
                  <h2>{work.title}</h2>
                  <p>{work.type}</p>
                </div>
              ))}
            </div>

            <nav className="digital-project-index" aria-label="Digital works index">
              {digitalWorks.map((work) => (
                <a href="#digital-works" key={work.id} onClick={(event) => event.preventDefault()}>
                  <b>{work.id}</b>
                  <strong>{work.title}</strong>
                  <small>{work.meta}</small>
                </a>
              ))}
            </nav>

            <p className="digital-scroll-hint">SCROLL TO OPEN PROJECTS</p>
          </div>
        </div>
      </section>

      {selectedDigitalWork && (
        <div
          className="digital-video-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedDigitalWork.title} full video`}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDigitalWork(null)
          }}
        >
          <button
            className="digital-video-lightbox-close"
            type="button"
            aria-label="Close full video"
            onClick={() => setSelectedDigitalWork(null)}
          >
            CLOSE <span aria-hidden="true">x</span>
          </button>
          <figure className="digital-video-lightbox-content">
            <video
              key={selectedDigitalWork.id}
              src={selectedDigitalWork.video}
              poster={selectedDigitalWork.cover}
              controls
              autoPlay
              playsInline
              preload="auto"
              onLoadedMetadata={(event) => {
                const video = event.currentTarget
                video.currentTime = 0
                video.play().catch(() => {})
              }}
            />
            <figcaption>
              <span>{String(selectedDigitalWork.index + 1).padStart(2, '0')}</span>
              <strong>{selectedDigitalWork.title}</strong>
              <small>{selectedDigitalWork.type}</small>
            </figcaption>
          </figure>
        </div>
      )}

      <PortfolioTail />
      </main>
    </ClickSpark>
  )
}

export default App
