import { useEffect, useRef, useState } from 'react'

const projects = [
  {
    id: '01',
    anchor: 'graphic-works',
    title: '存虚交汇，本真共在',
    english: 'AI / PARADOX',
    type: '视觉实验 · 书籍设计',
    image: '/images/project-01.webp',
    description: '从算法、信任与悖论出发，讨论虚拟经验与真实感知之间不断变化的边界。',
  },
  {
    id: '02',
    anchor: 'digital-works',
    title: '和音边界，重构再验',
    english: 'MUSIC / MOVE',
    type: '动态视觉 · 信息叙事',
    image: '/images/project-02.webp',
    description: '把声音、影像和空间线索拆解重组，让听觉经验转化为可阅读的视觉路径。',
  },
  {
    id: '03',
    anchor: 'shape-works',
    title: '造型基础四则',
    english: 'SKETCH / BASIS',
    type: '造型研究 · 综合材料',
    image: '/images/project-03.webp',
    description: '围绕观察、结构、质感与叙事展开的阶段性造型研究，保留材料本身的痕迹。',
  },
  {
    id: '04',
    title: '在校习作',
    english: 'SCHOOL / ASSIGNMENT',
    type: '绘画 · 人物研究',
    image: '/images/project-04.webp',
    description: '以人物为核心的素描与色彩练习，关注身体、表情以及日常场景中的微妙关系。',
  },
]

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [introStage, setIntroStage] = useState('loading')
  const [heroScene, setHeroScene] = useState('construction')
  const [peelOffset, setPeelOffset] = useState({ x: 0, y: 0 })
  const [isPeeling, setIsPeeling] = useState(false)
  const dragState = useRef(null)
  const revealTimer = useRef(null)
  const tapeMessage = 'I am Beverly Brennan · Welcome to my website'

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
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.14 },
    )

    revealItems.forEach((item) => observer.observe(item))

    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(height > 0 ? window.scrollY / height : 0)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  const completePeel = () => {
    if (heroScene !== 'construction') return

    dragState.current = null
    setIsPeeling(false)
    setPeelOffset({ x: window.innerWidth * 0.72, y: -window.innerHeight * 0.62 })
    setHeroScene('dissolving')

    revealTimer.current = window.setTimeout(() => setHeroScene('map'), 900)
  }

  const handlePeelStart = (event) => {
    if (heroScene !== 'construction') return

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
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      completePeel()
    }
  }

  return (
    <main>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />

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
          <a className="wordmark hero-wordmark" href="#home" aria-label="返回首页">
            PORTFOLIO<span>®</span>
          </a>
          <nav aria-label="主导航">
            <a href="#home">HOME</a>
            <a href="#about">ABOUT ME</a>
            <a href="#graphic-works">DESIGN WORKS</a>
            <a href="#shape-works">PLASTIC WORKS</a>
            <a href="#digital-works">DIGITAL WORKS</a>
          </nav>
        </header>

        <div className="final-map-layer" aria-hidden={heroScene !== 'map'}>
          <div className="final-map-heading">
            <strong>04 / PORTFOLIO</strong>
          </div>
          <img src="/images/hero-map-pattern.webp" alt="作品集四个章节的流程图" />
          <a className="final-map-arrow" href="#about" aria-label="前往关于我">
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
              <span>I am</span>
              <strong>Beverly Brennan</strong>
              <span>Welcome to my website</span>
            </div>

            <p className="peel-instruction">Drag the tape up and away to enter</p>

            <div
              className={`tape-cluster ${isPeeling ? 'is-dragging' : ''}`}
              style={{
                '--peel-x': `${peelOffset.x}px`,
                '--peel-y': `${peelOffset.y}px`,
                '--peel-rotate': `${Math.max(-14, Math.min(18, peelOffset.x / 24))}deg`,
              }}
              role="button"
              tabIndex={heroScene === 'construction' ? 0 : -1}
              aria-label="拖动撕开胶带进入作品集"
              onPointerDown={handlePeelStart}
              onPointerMove={handlePeelMove}
              onPointerUp={handlePeelEnd}
              onPointerCancel={handlePeelEnd}
              onKeyDown={handlePeelKey}
            >
              {[1, 2, 3].map((tape) => (
                <div className={`tape-strip tape-strip-${tape}`} key={tape}>
                  <div className="tape-copy">
                    <span>{tapeMessage}</span>
                    <span>{tapeMessage}</span>
                    <span>{tapeMessage}</span>
                  </div>
                </div>
              ))}
              <span className="peel-handle">PEEL <Arrow diagonal /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="about section" id="about">
        <div className="shell">
          <div className="section-label" data-reveal>
            <span>(01)</span>
            <span>ABOUT / 关于我</span>
            <span>敦化 → 北京</span>
          </div>

          <div className="about-grid">
            <div className="portrait-wrap" data-reveal>
              <div className="portrait-number">2005</div>
              <img src="/images/portrait.webp" alt="田京京个人照片" />
              <div className="portrait-caption">
                <span>田京京</span>
                <span>TIAN JINGJING</span>
              </div>
            </div>

            <div className="about-copy" data-reveal>
              <p className="eyebrow">A YOUNG CREATIVE, STILL BECOMING.</p>
              <h2>
                我把模糊的感受，
                <em>变成可以被看见的秩序。</em>
              </h2>
              <p className="about-body">
                我是田京京，来自吉林敦化，现就读于央美附中。我的创作游走于平面设计、动态视觉与造型研究之间，喜欢从音乐、文字和日常观察中寻找线索，再通过图像建立新的叙事关系。
              </p>

              <div className="details">
                <div>
                  <span>院校</span>
                  <strong>中央美术学院附属中等美术学校</strong>
                </div>
                <div>
                  <span>兴趣</span>
                  <strong>摇滚音乐 / 书法 / 骑行</strong>
                </div>
                <div>
                  <span>联系</span>
                  <strong>邮箱及社交账号待补充</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="stats" data-reveal>
            <div><strong>04</strong><span>精选项目</span></div>
            <div><strong>04+</strong><span>年持续创作</span></div>
            <div><strong>03</strong><span>创作方向</span></div>
            <div><strong>01</strong><span>持续生长的自我</span></div>
          </div>
        </div>
      </section>

      <section className="works section" id="works">
        <div className="shell">
          <div className="section-label section-label-light" data-reveal>
            <span>(02)</span>
            <span>SELECTED WORKS / 项目</span>
            <span>2021—2026</span>
          </div>

          <div className="works-heading" data-reveal>
            <h2>SELECTED<br /><em>WORKS</em></h2>
            <p>从概念到画面，四组关于媒介、声音、造型与人的视觉记录。</p>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project" id={project.anchor} key={project.id} data-reveal>
                <div className="project-media">
                  <img src={project.image} alt={`${project.title}项目展板`} loading="lazy" />
                  <span className="project-open"><Arrow diagonal /></span>
                  <span className="project-id">/{project.id}</span>
                </div>
                <div className="project-meta">
                  <div>
                    <span>{project.type}</span>
                    <h3>{project.title}</h3>
                  </div>
                  <p>{project.description}</p>
                  <strong>{project.english}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-lines" aria-hidden="true" />
        <div className="shell contact-inner">
          <div className="section-label" data-reveal>
            <span>(03)</span>
            <span>CONTACT / 保持联系</span>
            <span>AVAILABLE FOR NEW IDEAS</span>
          </div>

          <div className="contact-main" data-reveal>
            <p>有一个值得一起实现的想法？</p>
            <h2>LET'S MAKE<br /><em>SOMETHING REAL.</em></h2>
          </div>

          <div className="contact-bottom" data-reveal>
            <div className="contact-note">
              <span>EMAIL</span>
              <strong>待补充 / TO BE ADDED</strong>
              <p>正式邮箱和社交账号可在下一轮内容完善时接入。</p>
            </div>
            <a className="contact-circle" href="#home" aria-label="返回顶部">
              <span>BACK TO TOP</span>
              <span>↑</span>
            </a>
          </div>

          <footer>
            <span>© 2026 TIAN JINGJING</span>
            <span>DESIGNED WITH CURIOSITY</span>
            <span>吉林敦化 / 北京</span>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default App
