'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { status, responseData, registerData } from '@/utils/message';
import { useForm, Controller } from 'react-hook-form';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { MenuItem } from '@mui/material';
import { showToast } from '@/utils/helper';

const EditTemplateInfo = ({ open, setOpen, data, id, handleTemplateUpdate, emailPermission, flag }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (open && data) {
            reset({
                category: data?.category || '',
                title: data?.title || '',
                message: data?.message || '',
                isActive: data?.isActive || '',
            });
        }
    }, [data, open, reset]);

    const handleClose = () => {
        setOpen(false)
        // reset()
    };

    const handleUpdateTemplateData = async (data) => {
        setIsLoading(true);
        if (id) data.id = id;
        // const endpoint = flag === "email" ? '/api/email/template' : '/api/sms/template';
        let endpoint;
        if (flag === "email") {
            endpoint = '/api/email/template';
        } else if (flag === "voice-call") {
            endpoint = '/api/voice-call/template';
        } else if (flag === 'push-notification') {
            endpoint = '/api/push-notification/template';
        } else if (flag === 'whats-app') {
            endpoint = '/api/whats-app/template';
        } else {
            endpoint = '/api/sms/template';
        }
        const { data: { result, message } } = await apiClient.post(endpoint, data);
        if (result === true) {
            handleTemplateUpdate(message);
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
            <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                Edit Template Information
            </DialogTitle>
            <form onSubmit={handleSubmit(handleUpdateTemplateData)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                label={<CustomInputLabel htmlFor='category' text='Category' />}
                                placeholder='Category'
                                error={!!errors.category || apiErrors?.category}
                                helperText={errors?.category?.message || apiErrors?.category}
                                {...register('category', { required: registerData.categoryReq, validate: value => value.trim() !== '' || registerData.categoryReq })}
                            />
                        </Grid>
                        {flag === 'push-notification' && (<Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                label={<CustomInputLabel htmlFor='title' text='Title' />}
                                placeholder='title'
                                error={!!errors.title || apiErrors?.title}
                                helperText={errors?.title?.message || apiErrors?.title}
                                {...register('title', { required: registerData.titleReq, validate: value => value.trim() !== '' || registerData.titleReq })}
                            />
                        </Grid>)}
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                multiline="true"
                                rows={10}
                                label={<CustomInputLabel htmlFor='message' text='Message' />}
                                placeholder='Message'
                                error={!!errors.message || apiErrors?.message}
                                helperText={errors?.message?.message || apiErrors?.message}
                                {...register('message', { required: registerData.messageReq, validate: value => value.trim() !== '' || registerData.messageReq })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name='isActive'
                                control={control}
                                rules={{ required: registerData.statusReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        size={"small"}
                                        id='status'
                                        label={<CustomInputLabel htmlFor='status' text='Status' />}
                                        {...field}
                                        value={field.value || isActive}
                                        error={Boolean(errors?.isActive) || !!apiErrors?.isActive}
                                        helperText={errors?.isActive?.message || apiErrors?.isActive}
                                    >
                                        {status?.map(item => (
                                            <MenuItem value={item?.value} key={item?.id}>
                                                {item?.name}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    {((emailPermission?.editPermission === "Y")) && (
                        <Button variant='contained' type='submit'>
                            {isLoading ? <Loader type="btnLoader" /> : 'Submit'}
                        </Button>
                    )}
                    <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

EditTemplateInfo.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleTemplateUpdate: PropTypes.any,
    showToast: PropTypes.any,
    emailPermission: PropTypes.any,
    flag: PropTypes.string,
};

export default EditTemplateInfo
