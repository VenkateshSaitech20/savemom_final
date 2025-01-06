import { useMemo } from 'react'
import { useColorScheme } from '@mui/material'
import { useSettings } from './useSettings'

export const useImageVariant = (mode, imgLight, imgDark, imgLightBordered, imgDarkBordered) => {
  const { settings } = useSettings()
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()

  return useMemo(() => {
    const isServer = typeof window === 'undefined'

    const currentMode = (() => {
      if (isServer) return mode

      return muiMode === 'system' ? muiSystemMode : muiMode
    })()

    const isBordered = settings?.skin === 'bordered'
    const isDarkMode = currentMode === 'dark'

    if (isBordered && imgLightBordered && imgDarkBordered) {
      return isDarkMode ? imgDarkBordered : imgLightBordered
    }

    return isDarkMode ? imgDark : imgLight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, muiMode, muiSystemMode, settings?.skin, imgLight, imgDark, imgLightBordered, imgDarkBordered])
}
