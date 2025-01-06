'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm, Controller } from 'react-hook-form';
import { smsType, registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import SubUserPermission from '@/utils/SubUserPermission';
import CustomInputLabel from '@/components/asterick';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const SMSSetting = () => {
    const [apiErrors, setApiErrors] = useState({});
    const [id, setId] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, control, formState: { errors }, setValue } = useForm();
    const { smsPermission } = SubUserPermission();
    const [isAuthKeyShown, setIsAuthKeyShown] = useState(false);

    const handleClickShowPassword = () => setIsAuthKeyShown(show => !show)

    const handleOnSubmit = async (data) => {
        setIsButtonLoading(true);
        if (id) data.id = id;
        const response = await apiClient.post('/api/sms/setting', data);
        if (response.data.result === true) {
            setIsButtonLoading(true);
            showToast(true, response.data.message);
            setApiErrors({});
            getSMSSetting();
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
    }

    const getSMSSetting = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/sms/setting');
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
        getSMSSetting();
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
                                    name='smsType'
                                    control={control}
                                    rules={{ required: registerData.smsTypeReq }}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            variant='filled'
                                            InputLabelProps={{ shrink: true }}
                                            size={"small"}
                                            id='sms-type'
                                            label={<CustomInputLabel htmlFor='sms-type' text='SMS Type' />}
                                            {...field}
                                            error={Boolean(errors?.smsType) || !!apiErrors?.smsType}
                                            helperText={errors?.smsType?.message || apiErrors?.smsType}
                                        >
                                            {smsType?.map(type => (
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
                                    label={<CustomInputLabel htmlFor='mobile-no' text='Mobile No' />}
                                    variant='filled'
                                    InputLabelProps={{ shrink: true }}
                                    size={"small"}
                                    placeholder='Enter your mobile number'
                                    {...register('mobile', { required: registerData.mobReq })}
                                    error={!!errors?.mobile || !!apiErrors?.mobile}
                                    helperText={errors?.mobile?.message || apiErrors?.mobile}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Public key"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter public key / Account SID'
                                    // {...register('authKey', { required: registerData.authKeyReq, validate: value => value.trim() !== '' || registerData.authKeyReq })}
                                    {...register('publicKey')}
                                    error={!!errors?.publicKey || !!apiErrors?.publicKey}
                                    helperText={errors?.publicKey?.message || apiErrors?.publicKey}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Authkey / Authtoken / Sender ID"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='············'
                                    type={isAuthKeyShown ? 'text' : 'password'}
                                    // {...register('authKey', { required: registerData.authKeyReq, validate: value => value.trim() !== '' || registerData.authKeyReq })}
                                    {...register('authKey')}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                                                    <i className={isAuthKeyShown ? 'bx-hide' : 'bx-show'} />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    error={!!errors?.authKey || !!apiErrors?.authKey}
                                    helperText={errors?.authKey?.message || apiErrors?.authKey}
                                />
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(smsPermission?.editPermission === "Y" || smsPermission?.writePermission === "Y") && (
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

export default SMSSetting
