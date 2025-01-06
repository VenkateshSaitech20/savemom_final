'use client'
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import classnames from 'classnames';
import DirectionalIcon from '@components/DirectionalIcon';
import Logo from '@components/layout/shared/Logo';
import TextFieldStyled from '@core/components/mui/TextField';
import { getLocalizedUrl } from '@/utils/i18n';
import { registerData } from './../utils/message';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CustomInputLabel from '@/components/asterick';
import Loader from '@/components/loader';
import Alert from '@mui/material/Alert';

const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const ForgotPassword = () => {
  const { lang: locale } = useParams();
  const theme = useTheme();
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: {} })
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleForgetPassword = async (data) => {
    setApiError('');
    setIsButtonLoading(true);
    const { email } = data;
    const response = await axios.post('/api/forget-password', { email });
    if (response?.data?.result === true) {
      setSuccessMsg(response?.data?.message);
      setIsButtonLoading(false);
    } else {
      setIsButtonLoading(false);
      setApiError(response?.data?.message);
    }
    setIsButtonLoading(false);
  }

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  return (
    <div className='flex bs-full justify-center'>
      <div className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden'>
        <ForgotPasswordIllustration
          src='/images/illustrations/characters-with-objects/10.png'
          alt='character-illustration'
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography>Enter your email and we&#39;ll send you instructions to reset your password</Typography>
          </div>
          {successMsg && <Alert icon={false} severity="success">{successMsg}</Alert>}
          <form noValidate autoComplete='off' onSubmit={handleSubmit(handleForgetPassword)} className='flex flex-col gap-6'>
            <TextFieldStyled
              autoFocus
              fullWidth
              variant='filled'
              size={"small"}
              label={<CustomInputLabel htmlFor='email' text='Email' />}
              placeholder='Enter your email'
              {...register('email', { required: registerData.emailReq, validate: value => value.trim() !== '' || registerData.emailReq })}
              error={!!errors?.email || !!apiError}
              helperText={errors?.email?.message || apiError}
            />
            <Button fullWidth variant='contained' type='submit'>
              {isButtonLoading ? <Loader type="btnLoader" /> : 'Send reset link'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary'>
              <Link href={getLocalizedUrl('/login', locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon ltrIconClass='bx-chevron-left' rtlIconClass='bx-chevron-right' className='text-xl' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
