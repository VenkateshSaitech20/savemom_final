'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { profileStatus, registerData, responseData } from '@/utils/message';
import { Controller, useForm } from 'react-hook-form';
import { capitalizeFirstLetter } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
const EditUserInfo = ({ open, setOpen, data, id, handleUserDataUpdate, showToast }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [userRoles, setUserRoles] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm();
    useEffect(() => {
        if (open && data) {
            reset({
                name: data?.name || '',
                email: data?.email || '',
                profileStatus: capitalizeFirstLetter(data?.profileStatus) || '',
                contactNo: data?.contactNo || '',
                countryId: data?.countryId || '',
                roleId: data?.roleId || '',
            });
        }
    }, [data, open, reset]);
    // States
    // const [userData, setUserData] = useState(false)
    const handleClose = () => {
        setOpen(false)
        // reset()
    };
    const handleUpdateUserData = async (data) => {
        setIsLoading(true);
        delete data.email;
        const role = userRoles?.find((role) => role.id === data.roleId);
        const postData = { ...data, id, roleName: role.roleName };
        const { data: { result, message } } = await apiClient.post('/api/sub-user/edit-user-by-admin', postData);
        if (result === true) {
            handleUserDataUpdate(message);
            setOpen(false);
            setApiErrors({});
            showToast(true);
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
    const getUserRole = async () => {
        const response = await apiClient.post('/api/user-role/get-roles-by-user-id', {})
        if (response.data.result === true) {
            setUserRoles(response.data.message)
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    };
    const getCountry = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/master-data-settings/country');
        if (response.data.result === true) {
            setCountryData(response.data.message);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        getUserRole();
        getCountry();
    }, []);
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
                Edit User Information
                <Typography component='span' className='flex flex-col text-center'>
                    Updating user details will receive a privacy audit.
                </Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit(handleUpdateUserData)}>
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
                                label='Email'
                                placeholder='johnDoe@email.com'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                disabled
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='profileStatus'
                                control={control}
                                rules={{ required: registerData.profileStatusReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='select-profile'
                                        label={<CustomInputLabel htmlFor='select-profile' text='Select Profile Status' />}
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={Boolean(errors.profileStatus) || !!apiErrors?.profileStatus}
                                        helperText={errors.profileStatus ? errors.profileStatus.message : '' || apiErrors?.profileStatus}
                                    >
                                        {profileStatus.map((status) => (
                                            <MenuItem key={status.id} value={status.status}>
                                                {status.status}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='roleId'
                                control={control}
                                rules={{ required: registerData.roleNameReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='select-role'
                                        label={<CustomInputLabel htmlFor='select-role' text='Select Role' />}
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={Boolean(errors.roleId) || !!apiErrors?.roleId || !!apiErrors?.roleName}
                                        helperText={errors.roleId ? errors.roleId.message : '' || apiErrors?.roleId || apiErrors?.roleName}
                                    >
                                        {Array.isArray(userRoles) && userRoles?.map(role => (
                                            <MenuItem value={role.id} key={role.id}>
                                                {role.roleName}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Contact'
                                placeholder='9857452442'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('contactNo')}
                                error={!!apiErrors?.contactNo}
                                helperText={apiErrors?.contactNo}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='countryId'
                                control={control}
                                rules={{ required: registerData.countryNameReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='select-country'
                                        label='Select Country'
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={Boolean(errors.countryId) || !!apiErrors?.countryId}
                                        helperText={errors.countryId ? errors.countryId.message : '' || !!apiErrors?.countryId}
                                    >
                                        {countryData?.map((country) => (
                                            <MenuItem value={country.id} key={country.id}>
                                                {country.name}
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

EditUserInfo.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleUserDataUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default EditUserInfo
