'use client'
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm } from 'react-hook-form';
import { registerData } from '@/utils/message';
import { showToast } from '@/utils/helper';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';

const ChangePasswordCard = () => {
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [apiErrors, setApiErrors] = useState({});
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown)
  };

  const handleChangePassword = async (data) => {
    setApiErrors({});
    setIsButtonLoading(true);
    const response = await apiClient.post("/api/change-password", { ...data });
    if (response?.data?.result === true) {
      showToast(true, response.data.message);
      setApiErrors({});
    }
    setApiErrors(response.data.message);
    setIsButtonLoading(false);
  };

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(handleChangePassword)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <TextFieldStyled
                fullWidth
                label={<CustomInputLabel htmlFor='current-password' text='Current Password' />}
                type={isCurrentPasswordShown ? 'text' : 'password'}
                placeholder='············'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                error={!!errors?.currentPassword || !!apiErrors?.passwordNotValid || !!apiErrors?.currentPassword}
                helperText={errors?.currentPassword?.message || apiErrors?.passwordNotValid || apiErrors?.currentPassword}
                {...register('currentPassword', { required: registerData.currentPasswordReq, validate: value => value.trim() !== '' || registerData.currentPasswordReq })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowCurrentPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isCurrentPasswordShown ? 'bx-low-vision' : 'bx-show'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={6}>
            <Grid item xs={12} sm={6}>
              <TextFieldStyled
                fullWidth
                label={<CustomInputLabel htmlFor='new-password' text='New Password' />}
                type={isNewPasswordShown ? 'text' : 'password'}
                placeholder='············'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                {...register('newPassword', { required: registerData.newPasswordReq, validate: value => value.trim() !== '' || registerData.newPasswordReq })}
                error={!!errors?.newPassword || !!apiErrors?.PasswordMisMatch || !!apiErrors?.newPassword}
                helperText={errors?.newPassword?.message || apiErrors.PasswordMisMatch || apiErrors?.newPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isNewPasswordShown ? 'bx-low-vision' : 'bx-show'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={6}>
            <Grid item xs={12} sm={6}>
              <TextFieldStyled
                fullWidth
                label={<CustomInputLabel htmlFor='confirm-new-password' text='Confirm New Password' />}
                type={isConfirmPasswordShown ? 'text' : 'password'}
                placeholder='············'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                error={!!errors?.confirmPassword || !!apiErrors?.PasswordMisMatch || !!apiErrors?.confirmPassword}
                helperText={errors?.confirmPassword?.message || apiErrors?.confirmPassword}
                {...register('confirmPassword', { required: registerData.confirmPasswordReq, validate: value => value.trim() !== '' || registerData.confirmPasswordReq })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isConfirmPasswordShown ? 'bx-low-vision' : 'bx-show'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} className='flex gap-4'>
              <Button variant='contained' type='submit'>{isButtonLoading ? <Loader type="btnLoader" /> : "Save Changes"}</Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
