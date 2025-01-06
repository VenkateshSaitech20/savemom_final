'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { registerData, responseData, types } from '@/utils/message';
import { Controller, useForm } from 'react-hook-form';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { Typography } from '@mui/material';

const EditPaymentGatewayInfo = ({ open, setOpen, data, id, handleGatewayUpdate, showToast }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (open && data) {
            reset({
                name: data?.name || '',
                publicKey: data?.publicKey || '',
                privateKey: data?.privateKey || '',
                type: data?.type || '',
            });
        }
    }, [data, open, reset]);

    const handleClose = () => {
        setOpen(false)
        // reset()
    };

    const handleUpdateUserData = async (data) => {
        setIsLoading(true);
        const postData = { ...data, id };
        const { data: { result, message } } = await apiClient.post('/api/configure-subscription', postData);
        if (result === true) {
            handleGatewayUpdate(message);
            setOpen(false);
            setApiErrors({});
            showToast(true, responseData.dataUpdated);
        } else if (result === false) {
            if (message?.roleError?.name === responseData.tokenExpired || message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(message);
            }
        }
        setIsLoading(false);
    };

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleClose}
            maxWidth='md'
            scroll='body'
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
                <i className='bx-x' />
            </DialogCloseButton>
            <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-3 sm:pli-16'>
                Edit Configure Subscription
            </DialogTitle>
            <Typography variant='h6' className='text-warning text-center mb-2'>{registerData.packageConfigValMsg}</Typography>
            <form onSubmit={handleSubmit(handleUpdateUserData)} autoComplete='off'>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='name' text='Name' />}
                                placeholder='john'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('name', { required: registerData.nameReq })}
                                error={!!errors?.name || !!apiErrors?.name}
                                helperText={errors?.name ? errors?.name?.message : '' || apiErrors?.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Public Key'
                                placeholder='Enter your Public Key'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('publicKey', { required: registerData.publicKeyReq })}
                                error={!!errors?.publicKey || !!apiErrors?.publicKey}
                                helperText={errors?.publicKey?.message || apiErrors?.publicKey}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Private Key (Secret Key)'
                                placeholder='Enter your Private Key'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('privateKey', { required: registerData?.privateKeyReq })}
                                error={!!errors?.privateKey || !!apiErrors?.privateKey}
                                helperText={errors?.privateKey?.message || apiErrors?.privateKey}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='type'
                                control={control}
                                rules={{ required: registerData.typeReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='select-type'
                                        label={<CustomInputLabel htmlFor='select-type' text='Select Type' />}
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={Boolean(errors?.type) || !!apiErrors?.type}
                                        helperText={errors?.type?.message || apiErrors?.type}
                                    >
                                        {types?.map((item) => (
                                            <MenuItem key={item.id} value={item.type}>
                                                {item?.type}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    <Button variant='contained' type='submit'>
                        {isLoading ? <Loader type="btnLoader" /> : 'Submit'}
                    </Button>
                    <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

EditPaymentGatewayInfo.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleGatewayUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default EditPaymentGatewayInfo
