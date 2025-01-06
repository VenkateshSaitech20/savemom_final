'use client'
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import useVerticalNav from '@menu/hooks/useVerticalNav';
import { useSettings } from '@core/hooks/useSettings';
import axios from 'axios';
import PropTypes from "prop-types";

const LogoText = styled.span`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.15px;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 8px;'}
`

const Logo = ({ color }) => {
  const logoTextRef = useRef(null);
  const [metaData, setMetaData] = useState({});
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav();
  const { settings } = useSettings();
  const { layout } = settings;

  const getSystemSettings = useCallback(async () => {
    const response = await axios.get('/api/system-settings');
    if (response?.data?.result) {
      setMetaData(response.data.message);
    }
  }, []);

  useEffect(() => {
    getSystemSettings();
  }, [getSystemSettings]);

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached]);


  return (
    <div className='flex items-center'>
      <img src={metaData.navbarImage} className='w-[30px] h-[30px] text-2xl text-primary' />
      <LogoText
        color={color}
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
        className='ml-[0px]'
      >
        {metaData?.systemName}
      </LogoText>
    </div>
  )
}

Logo.propTypes = {
  color: PropTypes.any,
};

export default Logo
