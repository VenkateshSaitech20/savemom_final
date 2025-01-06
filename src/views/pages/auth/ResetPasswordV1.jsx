'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import DirectionalIcon from '@components/DirectionalIcon';
import Logo from '@components/layout/shared/Logo';
import TextFieldStyled from '@core/components/mui/TextField';
import { getLocalizedUrl } from '@/utils/i18n';
import AuthIllustrationWrapper from './AuthIllustrationWrapper';
import { registerData } from '@/utils/message';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Loader from '@/components/loader';
import CustomInputLabel from '@/components/asterick';

const ResetPassword = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const router = useRouter();
  const { lang: locale } = useParams()
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: {} });
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handlePasswordReset = async (data) => {
    setIsButtonLoading(true);
    setApiError({});
    if (data.newPassword !== data.newConfirmPassword) {
      setApiError(prevErr => ({ ...prevErr, passwordError: registerData.confirmPasswordValMsg }));
      setIsButtonLoading(false);
      return;
    }
    const postData = { newPassword: data.newPassword, newConfirmPassword: data.newConfirmPassword, token };
    const response = await axios.post('/api/reset-password', postData);
    if (response.data.result === true) {
      router.push('/')
    } else {
      setApiError(response.data.message);
    }
    setIsButtonLoading(false);
  };

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography>Your new password must be different from previously used passwords</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(handlePasswordReset)} className='flex flex-col gap-6'>
            <TextFieldStyled
              autoFocus
              fullWidth
              variant='filled'
              size={"small"}
              InputLabelProps={{ shrink: true }}
              label={<CustomInputLabel htmlFor='new-password' text='New Password' />}
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              {...register('newPassword', { required: registerData.passwordReq, validate: value => value.trim() !== '' || registerData.passwordReq })}
              error={!!errors?.newPassword || !!apiError?.newPassword}
              helperText={errors?.newPassword?.message || apiError?.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextFieldStyled
              fullWidth
              variant='filled'
              size={"small"}
              InputLabelProps={{ shrink: true }}
              label='Confirm Password'
              placeholder='············'
              type={isConfirmPasswordShown ? 'text' : 'password'}
              {...register('newConfirmPassword', { required: registerData.confirmPasswordReq, validate: value => value.trim() !== '' || registerData.confirmPasswordReq })}
              error={!!errors?.newConfirmPassword || !!apiError?.newConfirmPassword || !!apiError?.passwordError || !!apiError?.linkExpired}
              helperText={errors?.newConfirmPassword?.message || apiError?.newConfirmPassword || apiError?.passwordError || apiError?.linkExpired}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={isConfirmPasswordShown ? 'bx-hide' : 'bx-show'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button fullWidth variant='contained' type='submit'>
              {isButtonLoading ? <Loader type="btnLoader" /> : 'Set New Password'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary'>
              <Link href={getLocalizedUrl('/login', locale)} className='flex items-center gap-1'>
                <DirectionalIcon ltrIconClass='bx-chevron-left' rtlIconClass='bx-chevron-right' className='text-xl' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default ResetPassword
