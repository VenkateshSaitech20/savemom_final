'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import classnames from 'classnames'
import { styled, useTheme } from '@mui/material/styles'
import { registerData, validations } from './../utils/message';
import Logo from '@components/layout/shared/Logo'
import TextFieldStyled from '@core/components/mui/TextField'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import axios from 'axios';
import Loader from '@/components/loader'
import CustomInputLabel from '@/components/asterick'
import useDeviceToken from '@/app/api/api-utlis/get-fcm-token'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const router = useRouter();
  const { lang: locale } = useParams();
  const theme = useTheme();
  const { register, handleSubmit, formState: { errors }, setError } = useForm({ defaultValues: {} });
  const handleClickShowPassword = () => setIsPasswordShown(show => !show);
  const deviceToken = useDeviceToken();

  const onSubmit = async data => {
    setApiError('');
    setIsButtonLoading(true);
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    });
    if (res && res.ok && res.error === null) {
      data.deviceToken = deviceToken;
      const response = await axios.post('/api/login', data, {});
      if (response.data.result === true) {
        sessionStorage.setItem("token", response.data.message.token);
        const redirectURL = '/dashboards';
        router.replace(getLocalizedUrl(redirectURL, locale));
        setIsButtonLoading(false);
      } else {
        setApiError(response?.data?.message)
        setIsButtonLoading(false);
      }
    } else {
      setApiError(res.error);
      setIsButtonLoading(false);
    }
  };

  return (
    <div className='flex bs-full justify-center'>
      <div className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden'>
        <LoginIllustration
          src='/images/illustrations/characters-with-objects/7.png'
          alt='character-illustration'
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          <form
            noValidate
            autoComplete='off'
            action={() => { }}
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-6'
          >
            <TextFieldStyled
              fullWidth
              variant='filled'
              size={"small"}
              InputLabelProps={{ shrink: true }}
              label={<CustomInputLabel htmlFor='email' text='Email' />}
              placeholder='Enter your email'
              {...register('email', {
                required: registerData.emailReq, pattern: {
                  value: validations.emailPattern,
                  message: registerData.emailValMsg,
                },
              })}
              error={!!errors.email || !!apiError.message || !!apiError}
              helperText={errors.email?.message || apiError}
            />
            <TextFieldStyled
              fullWidth
              variant='filled'
              size={"small"}
              InputLabelProps={{ shrink: true }}
              label={<CustomInputLabel htmlFor='password' text='Password' />}
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              {...register('password', { required: registerData.passwordReq })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              {/* <FormControlLabel control={<Checkbox />} label='Remember me' /> */}
              <Typography
                className='text-end'
                color='primary'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale)}
              >
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit'>
              {isButtonLoading ? <Loader type="btnLoader" /> : 'Login'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href={'/register'} color='primary'>
                Create an account
              </Typography>
            </div>
            {/* <Divider className='gap-2 text-textPrimary'>or</Divider>
                        <Button
                            color='secondary'
                            className='self-center text-textPrimary'
                            startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
                            sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
                            onClick={() => signIn('google')}
                        >
                            Sign in with Google
                        </Button> */}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
