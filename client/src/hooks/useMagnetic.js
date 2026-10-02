import { useRef, useEffect } from 'react'

export function useMagnetic(strength = 0.25) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY)
      const maxDist = Math.max(rect.width, rect.height) * 1.2

      if (dist < maxDist) {
        const deltaX = (e.clientX - centerX) * strength
        const deltaY = (e.clientY - centerY) * strength
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      } else {
        el.style.transform = 'translate(0px, 0px)'
      }
    }

    const handleMouseLeave = () => {
      el.style.transform = 'translate(0px, 0px)'
      el.style.transition = 'transform 0.35s ease'
    }

    const handleMouseEnter = () => {
      el.style.transition = 'transform 0.1s ease-out'
    }

    window.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
    el.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (el) {
        el.removeEventListener('mouseleave', handleMouseLeave)
        el.removeEventListener('mouseenter', handleMouseEnter)
      }
    }
  }, [strength])

  return ref
}
