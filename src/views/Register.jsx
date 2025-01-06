'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import { styled, useTheme } from '@mui/material/styles';
import { FormHelperText } from '@mui/material';
import classnames from 'classnames';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';;
import Logo from '@components/layout/shared/Logo';
import TextFieldStyled from '@core/components/mui/TextField';
import { getLocalizedUrl } from '@/utils/i18n';
import { registerData, validations } from './../utils/message';
import CustomInputLabel from '@/components/asterick';
import useDeviceToken from '@/app/api/api-utlis/get-fcm-token';
import Loader from '@/components/loader';

const RegisterIllustration = styled('img')(({ theme }) => ({
	zIndex: 2,
	blockSize: 'auto',
	maxBlockSize: 600,
	maxInlineSize: '100%',
	margin: theme.spacing(12),
	[theme.breakpoints.down(1536)]: {
		maxBlockSize: 550
	},
	[theme.breakpoints.down('lg')]: {
		maxBlockSize: 450
	}
}));

const Register = () => {
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [isButtonLoading, setIsButtonLoading] = useState(false);
	const [apiErrors, setApiErrors] = useState({});
	const { register, handleSubmit, formState: { errors }, control } = useForm({ defaultValues: { termsAgreed: false } });
	const { lang: locale } = useParams();
	const theme = useTheme()
	const handleClickShowPassword = () => setIsPasswordShown(show => !show)
	const router = useRouter();
	const deviceToken = useDeviceToken();

	const handleUserRegister = async (data) => {
		setIsButtonLoading(true);
		data.deviceToken = deviceToken;
		const response = await axios.post('/api/register', data, {});
		if (response.data.result === true) {
			setIsButtonLoading(false);
			router.push('/en/login');
		} else {
			setIsButtonLoading(false);
			setApiErrors(response?.data?.message)
		}
		setIsButtonLoading(false);
	};

	return (
		<div className='flex bs-full justify-center'>
			<div className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden'>
				<RegisterIllustration
					src='/images/illustrations/characters-with-objects/8.png'
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
						<Typography variant='h4'>Adventure starts here 🚀</Typography>
						<Typography>Make your app management easy and fun!</Typography>
					</div>
					<form noValidate autoComplete='off' onSubmit={handleSubmit(handleUserRegister)} className='flex flex-col gap-6'>
						<TextFieldStyled
							autoFocus
							fullWidth
							label={<CustomInputLabel htmlFor='name' text='Name' />}
							variant='filled'
							size={"small"}
							InputLabelProps={{ shrink: true }}
							placeholder='Enter your username'
							{...register('name', { required: registerData.nameReq, validate: value => value.trim() !== '' || registerData.nameReq })}
							error={!!errors.name || !!apiErrors?.name}
							helperText={errors.name?.message || apiErrors?.name}
						/>
						<TextFieldStyled
							fullWidth
							label={<CustomInputLabel htmlFor='email' text='Email' />}
							variant='filled'
							size={"small"}
							InputLabelProps={{ shrink: true }}
							placeholder='Enter your email'
							{...register('email', {
								required: registerData.emailReq, pattern: {
									value: validations.emailPattern,
									message: registerData.emailValMsg,
								},
							})}
							error={!!errors?.email || !!apiErrors?.email}
							helperText={errors?.email?.message || apiErrors?.email}
						/>
						<TextFieldStyled
							fullWidth
							label={<CustomInputLabel htmlFor='password' text='Password' />}
							variant='filled'
							size={"small"}
							InputLabelProps={{ shrink: true }}
							placeholder='············'
							type={isPasswordShown ? 'text' : 'password'}
							{...register('password', { required: registerData.passwordReq, validate: value => value.trim() !== '' || registerData.passwordReq })}
							InputProps={{
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
											<i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
										</IconButton>
									</InputAdornment>
								)
							}}
							error={!!errors?.password || !!apiErrors?.password}
							helperText={errors?.password?.message || apiErrors?.password}
						/>
						<Controller
							name="termsAgreed"
							control={control}
							rules={{ required: 'You must agree to the privacy policy and terms' }}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Checkbox
											{...field}
											checked={field.value}
										/>
									}
									label={
										<>
											<span>I agree to </span>
											<Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
												privacy policy & terms
											</Link>
										</>
									}
								/>
							)}
						/>
						{errors?.termsAgreed && (
							<FormHelperText className="text-red-500">{errors.termsAgreed.message}</FormHelperText>
						)}
						<Button fullWidth variant='contained' type='submit'>
							{isButtonLoading ? <Loader type="btnLoader" /> : 'Sign Up'}
						</Button >
						<div className='flex justify-center items-center flex-wrap gap-2'>
							<Typography>Already have an account?</Typography>
							<Typography component={Link} href={getLocalizedUrl('/login', locale)} color='primary'>
								Sign in instead
							</Typography>
						</div>
						<Divider className='gap-2 text-textPrimary'>or</Divider>
						<div className='flex justify-center items-center gap-1.5'>
							<IconButton className='text-facebook' size='small'>
								<i className='bx-bxl-facebook-circle' />
							</IconButton>
							<IconButton className='text-twitter' size='small'>
								<i className='bx-bxl-twitter' />
							</IconButton>
							<IconButton className='text-textPrimary' size='small'>
								<i className='bx-bxl-github' />
							</IconButton>
							<IconButton className='text-error' size='small'>
								<i className='bx-bxl-google' />
							</IconButton>
						</div>
					</form >
				</div >
			</div >
		</div >
	)
}

export default Register
