'use client'
import { useRef, useState } from 'react';
import Link from 'next/link';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import classnames from 'classnames';
import { useSettings } from '@core/hooks/useSettings';
import PropTypes from "prop-types";

const IconButtonWrapper = props => {
  const { tooltipProps, children } = props

  return tooltipProps?.title ? <Tooltip {...tooltipProps}>{children}</Tooltip> : children
}

const MenuItemWrapper = ({ children, option }) => {
  if (option.href) {
    return (
      <Box component={Link} href={option.href} {...option.linkProps}>
        {children}
      </Box>
    )
  } else {
    return <>{children}</>
  }
}

const OptionMenu = props => {
  const { tooltipProps, icon, iconClassName, options, leftAlignMenu, iconButtonProps } = props
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const { settings } = useSettings();

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }

  return (
    <>
      <IconButtonWrapper tooltipProps={tooltipProps}>
        <IconButton ref={anchorRef} size='small' onClick={handleToggle} {...iconButtonProps}>
          {typeof icon === 'string' ? (
            <i className={classnames(icon, iconClassName)} />
          ) : icon ? (
            icon
          ) : (
            <i className={classnames('bx-dots-vertical-rounded', iconClassName)} />
          )}
        </IconButton>
      </IconButtonWrapper>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={leftAlignMenu ? 'bottom-start' : 'bottom-end'}
        transition
        disablePortal
        sx={{ zIndex: 1 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open}>
                  {options.map((option, index) => {
                    if (typeof option === 'string') {
                      return (
                        <MenuItem key={index} onClick={handleClose}>
                          {option}
                        </MenuItem>
                      )
                    } else if ('divider' in option) {
                      return option.divider && <Divider key={index} {...option.dividerProps} />
                    } else {
                      return (
                        <MenuItem
                          key={index}
                          {...option.menuItemProps}
                          {...(option.href && { className: 'p-0' })}
                          onClick={e => {
                            handleClose(e)
                            option.menuItemProps && option.menuItemProps.onClick
                              ? option.menuItemProps.onClick(e)
                              : null
                          }}
                        >
                          <MenuItemWrapper option={option}>
                            {(typeof option.icon === 'string' ? <i className={option.icon} /> : option.icon) || null}
                            {option.text}
                          </MenuItemWrapper>
                        </MenuItem>
                      )
                    }
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

OptionMenu.propTypes = {
  icon: PropTypes.any,
  tooltipProps: PropTypes.any,
  iconClassName: PropTypes.any,
  options: PropTypes.any,
  leftAlignMenu: PropTypes.any,
  iconButtonProps: PropTypes.any,
};
MenuItemWrapper.propTypes = {
  children: PropTypes.any,
  option: PropTypes.any,
};
IconButtonWrapper.propTypes = {
  children: PropTypes.any,
  tooltipProps: PropTypes.any,
  title: PropTypes.any,
};
export default OptionMenu
