'use client'
import { Fragment, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import classnames from 'classnames';
import Loader from '@/components/loader';
import PropTypes from "prop-types";

const ConfirmationDialog = ({ open, setOpen, type, onConfirm, errorMsg }) => {
  const [secondDialog, setSecondDialog] = useState(false);
  const [userInput, setUserInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setOpen(false)
  }

  // const handleConfirmation = value => {
  //   onConfirm(value);
  //   setUserInput(value)
  //   if (!errorMsg) {
  //     setSecondDialog(true)
  //     setOpen(false)
  //   }
  // }

  const handleConfirmation = async (value) => {
    if (value) {
      setIsLoading(true);
      const success = await onConfirm(value);
      setUserInput(value);
      setIsLoading(false)
      if (success === true || success === undefined) {
        setSecondDialog(true);
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  };

  const dialogMessages = {
    'suspend-account': 'Yes, Suspend User!',
    'delete-order': 'Yes, Delete Order!',
    'delete-customer': 'Yes, Delete Customer!',
    default: 'Yes'
  };

  const dialogMessage = dialogMessages[type] || dialogMessages.default;

  return (
    <>
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='bx-error-circle text-[88px] mbe-6 text-warning' />
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-2'
            })}
          >
            <Typography variant='h4'>
              {type === 'delete-role' && 'Are you sure you want to delete role?'}
              {type === 'delete-user' && 'Are you sure you want to delete user?'}
              {type === 'delete-faq' && 'Are you sure you want to delete faq?'}
              {type === 'delete-plan' && 'Are you sure you want to delete plan?'}
              {type === 'delete-testimonial' && 'Are you sure you want to delete testimonial?'}
              {type === 'delete-feature' && 'Are you sure you want to delete feature?'}
              {type === 'delete-team' && 'Are you sure you want to delete team?'}
              {type === 'delete-key-achievement' && 'Are you sure you want to delete key achievement?'}
              {type === 'payment-method' && 'Are you sure you want to delete payment method?'}
              {type === 'delete-account' && 'Are you sure you want to deactivate your account?'}
              {type === 'delete-brand' && 'Are you sure you want to delete brand?'}
              {type === 'unsubscribe' && 'Are you sure to cancel your subscription?'}
              {type === 'suspend-account' && 'Are you sure?'}
              {type === 'delete-order' && 'Are you sure?'}
              {type === 'delete-customer' && 'Are you sure?'}
              {type === 'delete-template' && 'Are you sure you want to delete template?'}
              {type === 'delete-country' && 'Are you sure want to delete the country?'}
              {type === 'delete-state' && 'Are you sure want to delete the state?'}
              {type === 'delete-district' && 'Are you sure want to delete the district?'}
              {type === 'delete-city' && 'Are you sure want to delete the city?'}
              {type === 'delete-category' && 'Are you sure want to delete the category?'}
              {type === 'delete-content' && 'Are you sure want to delete the content?'}
            </Typography>
            {type === 'suspend-account' && (
              <Typography color='text.primary'>You won&#39;t be able to revert user!</Typography>
            )}
            {type === 'delete-order' && (
              <Typography color='text.primary'>You won&#39;t be able to revert order!</Typography>
            )}
            {type === 'delete-customer' && (
              <Typography color='text.primary'>You won&#39;t be able to revert customer!</Typography>
            )}
            {errorMsg && (
              <Typography className="text-red-500 mt-2">{errorMsg}</Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='max-sm:flex-col max-sm:gap-4 justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)} className='max-sm:is-full'>
            {isLoading ? <Loader type="btnLoader" /> : dialogMessage}
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              handleConfirmation(false)
            }}
            className='max-sm:mis-0 max-sm:is-full'
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={secondDialog} onClose={handleSecondDialogClose}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i
            className={classnames('text-[88px] mbe-6', {
              'bx-check-circle': userInput,
              'text-success': userInput,
              'bx-x-circle': !userInput,
              'text-error': !userInput
            })}
          />
          <Typography variant='h4' className='mbe-2'>
            {userInput
              ? `${type === 'delete-account' ? 'Deactivated' : type === 'unsubscribe' ? 'Unsubscribed' : type === 'delete-order' || 'delete-customer' ? 'Deleted' : 'Suspended!'}`
              : 'Cancelled'}
          </Typography>
          <Typography color='text.primary'>
            {userInput ? (
              <>
                {type === 'delete-account' && 'Your account has been deactivated successfully.'}
                {type === 'unsubscribe' && 'Your subscription cancelled successfully.'}
                {type === 'suspend-account' && 'User has been suspended.'}
                {type === 'delete-order' && 'Your order deleted successfully.'}
                {type === 'delete-customer' && 'Your customer removed successfully.'}
              </>
            ) : (
              <>
                {type === 'delete-account' && 'Account Deactivation Cancelled!'}
                {type === 'unsubscribe' && 'Unsubscription Cancelled!!'}
                {type === 'suspend-account' && 'Cancelled Suspension :)'}
                {type === 'delete-order' && 'Order Deletion Cancelled'}
                {type === 'delete-customer' && 'Customer Deletion Cancelled'}
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

ConfirmationDialog.propTypes = {
  open: PropTypes.any,
  setOpen: PropTypes.any,
  type: PropTypes.any,
  onConfirm: PropTypes.any,
  errorMsg: PropTypes.any
}
export default ConfirmationDialog
