'use client'
import { useState } from 'react';
import PropTypes from "prop-types";

const OpenDialogOnElementClick = props => {
  const { element: Element, dialog: Dialog, elementProps, dialogProps, roleId } = props
  const [open, setOpen] = useState(false)

  // Extract onClick from elementProps
  const { onClick: elementOnClick, ...restElementProps } = elementProps

  // Handle onClick event
  const handleOnClick = e => {
    // console.log('element clicked', roleId)
    elementOnClick && elementOnClick(e)
    setOpen(true)
  }

  return (
    <>
      {/* Receive element component as prop and we will pass onclick event which changes state to open */}
      <Element onClick={handleOnClick} {...restElementProps} />
      {/* Receive dialog component as prop and we will pass open and setOpen props to that component */}
      <Dialog open={open} setOpen={setOpen} {...dialogProps} roleId={roleId} />
    </>
  )
}

OpenDialogOnElementClick.propTypes = {
  element: PropTypes.any,
  dialog: PropTypes.any,
  elementProps: PropTypes.any,
  dialogProps: PropTypes.any,
  roleId: PropTypes.any,
};
export default OpenDialogOnElementClick
