'use client'

import { useEffect, useRef, useState } from 'react'

type ArticleHtmlFrameProps = {
  title: string
  html: string
}

export default function ArticleHtmlFrame({
  title,
  html,
}: ArticleHtmlFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [height, setHeight] = useState(1400)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let resizeObserver: ResizeObserver | null = null
    let mutationObserver: MutationObserver | null = null
    let intervalId: number | null = null
    let timeoutIds: number[] = []
    let rafId: number | null = null

    const measureHeight = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return 0

        const body = doc.body
        const htmlEl = doc.documentElement
        if (!body || !htmlEl) return 0

        body.style.overflow = 'hidden'
        htmlEl.style.overflow = 'hidden'

        const bodyHeights = [
          body.scrollHeight,
          body.offsetHeight,
          body.clientHeight,
          body.getBoundingClientRect().height,
        ]

        const htmlHeights = [
          htmlEl.scrollHeight,
          htmlEl.offsetHeight,
          htmlEl.clientHeight,
          htmlEl.getBoundingClientRect().height,
        ]

        const maxHeight = Math.max(...bodyHeights, ...htmlHeights)

        return Number.isFinite(maxHeight) ? Math.ceil(maxHeight) : 0
      } catch {
        return 0
      }
    }

    const updateHeight = () => {
      const measured = measureHeight()

      if (measured > 0) {
        const bufferedHeight = measured + 48
        setHeight((prev) => (bufferedHeight > prev ? bufferedHeight : Math.max(bufferedHeight, 600)))
      }
    }

    const runHeightChecks = () => {
      updateHeight()

      timeoutIds.forEach((id) => window.clearTimeout(id))
      timeoutIds = [
        window.setTimeout(updateHeight, 50),
        window.setTimeout(updateHeight, 150),
        window.setTimeout(updateHeight, 300),
        window.setTimeout(updateHeight, 600),
        window.setTimeout(updateHeight, 1000),
        window.setTimeout(updateHeight, 1600),
        window.setTimeout(updateHeight, 2400),
      ]

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }

      rafId = window.requestAnimationFrame(() => {
        updateHeight()
      })
    }

    const attachAssetListeners = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return

        const images = Array.from(doc.images)
        images.forEach((image) => {
          image.addEventListener('load', runHeightChecks)
          image.addEventListener('error', runHeightChecks)
        })

        const videos = Array.from(doc.querySelectorAll('video'))
        videos.forEach((video) => {
          video.addEventListener('loadedmetadata', runHeightChecks)
          video.addEventListener('loadeddata', runHeightChecks)
          video.addEventListener('canplay', runHeightChecks)
          video.addEventListener('error', runHeightChecks)
        })

        const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
        if (fonts?.ready) {
          void fonts.ready.then(() => {
            runHeightChecks()
          })
        }
      } catch {
        // Ignore safely
      }
    }

    const handleLoad = () => {
      runHeightChecks()
      attachAssetListeners()

      try {
        const doc = iframe.contentDocument
        if (!doc) return

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            runHeightChecks()
          })

          if (doc.body) {
            resizeObserver.observe(doc.body)
          }

          if (doc.documentElement) {
            resizeObserver.observe(doc.documentElement)
          }
        }

        mutationObserver = new MutationObserver(() => {
          runHeightChecks()
        })

        mutationObserver.observe(doc.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        })

        intervalId = window.setInterval(() => {
          runHeightChecks()
        }, 1200)
      } catch {
        // Ignore safely
      }
    }

    iframe.addEventListener('load', handleLoad)

    return () => {
      iframe.removeEventListener('load', handleLoad)

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (mutationObserver) {
        mutationObserver.disconnect()
      }

      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }

      timeoutIds.forEach((id) => window.clearTimeout(id))

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={html}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      scrolling="no"
      className="block w-full"
      style={{
        height: `${height}px`,
        overflow: 'hidden',
        border: '0',
        display: 'block',
        background: 'transparent',
      }}
    />
  )
}