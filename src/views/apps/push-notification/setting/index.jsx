'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm, Controller } from 'react-hook-form';
import { registerData, responseData, pushNotificationType } from '@/utils/message';
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
    const { pushNotificationPermission } = SubUserPermission();
    const [isPrivateKeyShown, setIsPrivateKeyShown] = useState(false);

    const handleClickShowPassword = () => setIsPrivateKeyShown(show => !show)

    const handleOnSubmit = async (data) => {
        setIsButtonLoading(true);
        if (id) data.id = id;
        const response = await apiClient.post('/api/push-notification/setting', data);
        if (response.data.result === true) {
            setIsButtonLoading(true);
            showToast(true, response.data.message);
            setApiErrors({});
            getPushNotificationSetting();
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

    const getPushNotificationSetting = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/push-notification/setting');
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
        getPushNotificationSetting();
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
                                    name='pushNotificationType'
                                    control={control}
                                    rules={{ required: registerData.pushNotificationTypeReq }}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            variant='filled'
                                            InputLabelProps={{ shrink: true }}
                                            size={"small"}
                                            id='push-notification-type'
                                            label={<CustomInputLabel htmlFor='account-type' text='Push Notification Type' />}
                                            {...field}
                                            error={Boolean(errors?.pushNotificationType) || !!apiErrors?.pushNotificationType}
                                            helperText={errors?.pushNotificationType?.message || apiErrors?.pushNotificationType}
                                        >
                                            {pushNotificationType?.map(type => (
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
                                    label={<CustomInputLabel htmlFor='type' text='Vapid key' />}
                                    variant='filled'
                                    InputLabelProps={{ shrink: true }}
                                    size={"small"}
                                    placeholder='Enter Account Type'
                                    {...register('vapidKey', { required: registerData.vapidKeyReq })}
                                    error={!!errors?.vapidKey || !!apiErrors?.vapidKey}
                                    helperText={errors?.vapidKey?.message || apiErrors?.vapidKey}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label={<CustomInputLabel htmlFor='type' text='Account Type' />}
                                    variant='filled'
                                    InputLabelProps={{ shrink: true }}
                                    size={"small"}
                                    placeholder='Enter Account Type'
                                    {...register('type', { required: registerData.accountTypeReq })}
                                    error={!!errors?.type || !!apiErrors?.type}
                                    helperText={errors?.type?.message || apiErrors?.type}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="ProjectId"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Project Id'
                                    // {...register('authKey', { required: registerData.authKeyReq, validate: value => value.trim() !== '' || registerData.authKeyReq })}
                                    {...register('projectId')}
                                    error={!!errors?.projectId || !!apiErrors?.projectId}
                                    helperText={errors?.projectId?.message || apiErrors?.projectId}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Private Key Id"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Private Key Id'
                                    {...register('privateKeyId')}
                                    error={!!errors?.privateKeyId || !!apiErrors?.privateKeyId}
                                    helperText={errors?.privateKeyId?.message || apiErrors?.privateKeyId}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Private Key"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Private Key'
                                    type={isPrivateKeyShown ? 'text' : 'password'}
                                    {...register('privateKey')}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                                                    <i className={isPrivateKeyShown ? 'bx-hide' : 'bx-show'} />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    error={!!errors?.privateKey || !!apiErrors?.privateKey}
                                    helperText={errors?.privateKey?.message || apiErrors?.privateKey}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Client Email"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Client Email'
                                    {...register('clientEmail')}
                                    error={!!errors?.clientEmail || !!apiErrors?.clientEmail}
                                    helperText={errors?.clientEmail?.message || apiErrors?.clientEmail}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Client Id"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Client Id'
                                    {...register('clientId')}
                                    error={!!errors?.clientId || !!apiErrors?.clientId}
                                    helperText={errors?.clientId?.message || apiErrors?.clientId}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Auth Uri"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Auth Uri'
                                    {...register('authUri')}
                                    error={!!errors?.authUri || !!apiErrors?.authUri}
                                    helperText={errors?.authUri?.message || apiErrors?.authUri}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Token Uri"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Token Uri'
                                    {...register('tokenUri')}
                                    error={!!errors?.tokenUri || !!apiErrors?.tokenUri}
                                    helperText={errors?.tokenUri?.message || apiErrors?.tokenUri}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Auth Provider Cert Url"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Auth Provider Cert Uri'
                                    {...register('authProviderCertUrl')}
                                    error={!!errors?.authProviderCertUrl || !!apiErrors?.authProviderCertUrl}
                                    helperText={errors?.authProviderCertUrl?.message || apiErrors?.authProviderCertUrl}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Client Cert Url"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter client Cert Uri'
                                    {...register('clientCertUrl')}
                                    error={!!errors?.clientCertUrl || !!apiErrors?.clientCertUrl}
                                    helperText={errors?.clientCertUrl?.message || apiErrors?.clientCertUrl}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    label="Universe Domain"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Universe Domain'
                                    {...register('universeDomain')}
                                    error={!!errors?.universeDomain || !!apiErrors?.universeDomain}
                                    helperText={errors?.universeDomain?.message || apiErrors?.universeDomain}
                                />
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(pushNotificationPermission?.editPermission === "Y" || pushNotificationPermission?.writePermission === "Y") && (
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
