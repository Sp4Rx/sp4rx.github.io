import React from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Use pointer:coarse media query to detect touch screens
    const touchMediaQuery = window.matchMedia("(pointer: coarse)")

    const onChange = () => {
      // Device is considered mobile if it has a touch screen (pointer:coarse)
      setIsMobile(touchMediaQuery.matches)
    }

    touchMediaQuery.addEventListener("change", onChange)
    // Set initial value
    setIsMobile(touchMediaQuery.matches)

    return () => touchMediaQuery.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
