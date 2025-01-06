'use client'
import { forwardRef } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import { lighten, styled } from '@mui/material/styles';
import PropTypes from "prop-types";

const Avatar = styled(MuiAvatar)(({ skin, color, size, theme }) => {
  return {
    ...(color &&
      skin === 'light' && {
      backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
      color: `var(--mui-palette-${color}-main)`
    }),
    ...(color &&
      skin === 'light-static' && {
      backgroundColor: lighten(theme.palette[color].main, 0.84),
      color: `var(--mui-palette-${color}-main)`
    }),
    ...(color &&
      skin === 'filled' && {
      backgroundColor: `var(--mui-palette-${color}-main)`,
      color: `var(--mui-palette-${color}-contrastText)`
    }),
    ...(size && {
      height: size,
      width: size
    })
  }
})

const CustomAvatar = forwardRef((props, ref) => {
  const { color, skin = 'filled', ...rest } = props

  return <Avatar color={color} skin={skin} ref={ref} {...rest} />
})

CustomAvatar.propTypes = {
  color: PropTypes.any,
  skin: PropTypes.any,
};
export default CustomAvatar
