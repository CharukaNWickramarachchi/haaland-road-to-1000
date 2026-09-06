import { animate, useMotionValue, useTransform, motion } from 'framer-motion'
import { useEffect } from 'react'

export function AnimatedCounter({
  value,
  duration = 1.4,
  className = '',
}: {
  value: number
  duration?: number
  className?: string
}) {
  const motionValue = useMotionValue(0)

  const rounded = useTransform(
    motionValue,
    (latest) => Math.round(latest),
  )

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    })

    return () => controls.stop()
  }, [motionValue, value, duration])

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  )
}