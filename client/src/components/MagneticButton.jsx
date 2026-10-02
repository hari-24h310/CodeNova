import React from 'react'
import { useMagnetic } from '../hooks/useMagnetic'

export default function MagneticButton({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  style = {},
  strength = 0.22,
  ...props
}) {
  const magneticRef = useMagnetic(disabled ? 0 : strength)

  return (
    <button
      ref={magneticRef}
      type={type}
      className={`btn-magnetic-wrapper ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  )
}
