'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm, Controller } from 'react-hook-form';
import { emailCompany, emailType, registerData, responseData, validations } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import SubUserPermission from '@/utils/SubUserPermission';
import CustomInputLabel from '@/components/asterick';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const EmailSetting = () => {
    const [apiErrors, setApiErrors] = useState({});
    const [id, setId] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, control, formState: { errors }, setValue } = useForm();
    const { emailPermission } = SubUserPermission();
    const [isPasswordShown, setIsPasswordShown] = useState(false);

    const handleClickShowPassword = () => setIsPasswordShown(show => !show)

    const handleOnSubmit = async (data) => {
        setIsButtonLoading(true);
        if (id) data.id = id;
        const response = await apiClient.post('/api/email/setting', data);
        if (response.data.result === true) {
            setIsButtonLoading(true);
            showToast(true, response.data.message);
            setApiErrors({});
            getEmailSetting();
            setIsButtonLoading(false);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(response.data.message);
                setIsButtonLoading(false);
            }
        }
    };

    const getEmailSetting = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/email/setting');
        if (response.data.result === true) {
            if (response.data.message) {
                const data = response.data.message;
                Object.keys(data).forEach((key) => {
                    setValue(key, data[key]);
                });
                if (data.id) {
                    setId(data.id);
                }
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getEmailSetting();
    }, []);

    return (
        <Card>
            {isLoading && <div className='my-4'><Loader /></div>}
            {!isLoading && (
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleOnSubmit)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name='emailCompany'
                                    control={control}
                                    rules={{ required: registerData.emailCompanyReq }}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            variant='filled'
                                            InputLabelProps={{ shrink: true }}
                                            size={"small"}
                                            id='email-company'
                                            label={<CustomInputLabel htmlFor='email-company' text='Email Company' />}
                                            {...field}
                                            error={Boolean(errors?.emailCompany) || !!apiErrors?.emailCompany}
                                            helperText={errors?.emailCompany?.message || apiErrors?.emailCompany}
                                        >
                                            {emailCompany?.map(type => (
                                                <MenuItem value={type?.value} key={type?.id}>
                                                    {type?.name}
                                                </MenuItem>
                                            ))}
                                        </TextFieldStyled>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name='emailType'
                                    control={control}
                                    rules={{ required: registerData.emailTypeReq }}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            variant='filled'
                                            InputLabelProps={{ shrink: true }}
                                            size={"small"}
                                            id='email-type'
                                            label={<CustomInputLabel htmlFor='email-type' text='Email Type' />}
                                            {...field}
                                            error={Boolean(errors?.emailType) || !!apiErrors?.emailType}
                                            helperText={errors?.emailType?.message || apiErrors?.emailType}
                                        >
                                            {emailType?.map(type => (
                                                <MenuItem value={type?.value} key={type?.id}>
                                                    {type?.name}
                                                </MenuItem>
                                            ))}
                                        </TextFieldStyled>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label={<CustomInputLabel htmlFor='email-id' text='Email Id' />}
                                    variant='filled'
                                    InputLabelProps={{ shrink: true }}
                                    size={"small"}
                                    placeholder='Enter your email'
                                    {...register('email', {
                                        required: registerData.emailReq,
                                        pattern: {
                                            value: validations.emailPattern,
                                            message: registerData.emailValMsg
                                        }
                                    })}
                                    error={!!errors?.email || !!apiErrors?.email}
                                    helperText={errors?.email?.message || apiErrors?.email}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="API Key"
                                    variant='filled'
                                    InputLabelProps={{ shrink: true }}
                                    size={"small"}
                                    placeholder='Enter your API Key'
                                    {...register('apiKey')}
                                    error={!!errors?.apiKey || !!apiErrors?.apiKey}
                                    helperText={errors?.apiKey?.message || apiErrors?.apiKey}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Password/SID/Domain Id"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='············'
                                    type={isPasswordShown ? 'text' : 'password'}
                                    {...register('password')}
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
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(emailPermission?.editPermission === "Y" || emailPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Save"}
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            )}
        </Card>
    )
}

export default EmailSetting
