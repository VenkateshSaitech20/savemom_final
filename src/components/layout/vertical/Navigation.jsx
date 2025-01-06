'use client'
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { styled, useColorScheme, useTheme } from '@mui/material/styles';
import VerticalNav, { NavHeader, NavCollapseIcons } from '@menu/vertical-menu';
import VerticalMenu from './VerticalMenu';
import Logo from '@components/layout/shared/Logo';
import useVerticalNav from '@menu/hooks/useVerticalNav';
import { useSettings } from '@core/hooks/useSettings';
import { useSession } from 'next-auth/react';;
import { getLocalizedUrl } from '@/utils/i18n';
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles';
import PropTypes from "prop-types";

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 72,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: '100%',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-paper) ${theme.direction === 'rtl' ? '95%' : '5%'}, rgb(var(--mui-palette-background-paperChannel) / 0.85) 30%, rgb(var(--mui-palette-background-paperChannel) / 0.5) 65%, rgb(var(--mui-palette-background-paperChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const MenuToggle = (
  <div className='icon-wrapper'>
    <i className='bx-bxs-chevron-left' />
  </div>
)

const Navigation = props => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { dictionary, mode, systemMode } = props
  const verticalNavOptions = useVerticalNav()
  const { updateSettings, settings } = useSettings()
  const { lang: locale } = useParams()
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()
  const theme = useTheme()

  // Refs
  const shadowRef = useRef(null)

  // Vars
  const { isCollapsed, isHovered, collapseVerticalNav, isBreakpointReached } = verticalNavOptions
  const isServer = typeof window === 'undefined'
  const isSemiDark = settings.semiDark
  let isDark

  if (isServer) {
    isDark = mode === 'system' ? systemMode === 'dark' : mode === 'dark'
  } else {
    isDark = muiMode === 'system' ? muiSystemMode === 'dark' : muiMode === 'dark'
  }

  const scrollMenu = (container, isPerfectScrollbar) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  useEffect(() => {
    if (settings.layout === 'collapsed') {
      collapseVerticalNav(true)
    } else {
      collapseVerticalNav(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout])

  useEffect(() => {
    if (status === 'loading') { return };
    // console.log("session", session)
    if (!session) router.push('/login');
  }, [status, session]);

  return (
    // eslint-disable-next-line lines-around-comment
    // Sidebar Vertical Menu
    <VerticalNav
      customStyles={navigationCustomStyles(verticalNavOptions, theme, settings)}
      collapsedWidth={85}
      backgroundColor='var(--mui-palette-background-paper)'
      // eslint-disable-next-line lines-around-comment
      // The following condition adds the data-mui-color-scheme='dark' attribute to the VerticalNav component
      // when semiDark is enabled and the mode or systemMode is light
      {...(isSemiDark &&
        !isDark && {
        'data-mui-color-scheme': 'dark'
      })}
    >
      {/* Nav Header including Logo & nav toggle icons  */}
      <NavHeader>
        <Link href={getLocalizedUrl('/', locale)}>
          <Logo />
        </Link>
        {!(isCollapsed && !isHovered) && (
          <NavCollapseIcons
            lockedIcon={MenuToggle}
            unlockedIcon={MenuToggle}
            closeIcon={MenuToggle}
            onClick={() => updateSettings({ layout: !isCollapsed ? 'collapsed' : 'vertical' })}
          />
        )}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu dictionary={dictionary} scrollMenu={scrollMenu} />
    </VerticalNav>
  )
}

Navigation.propTypes = {
  dictionary: PropTypes.any,
  mode: PropTypes.any,
  systemMode: PropTypes.any,
};
export default Navigation
