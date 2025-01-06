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
import { registerData, responseData } from '@/utils/message';
import { Controller, useForm } from 'react-hook-form';
import { showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
const CountryDialog = ({ open, setOpen, data, id, handleCountryUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [countryData, setCountryData] = useState({});
    const { register, handleSubmit, formState: { errors }, control, reset, clearErrors } = useForm();
    const getCountry = async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/master-data-settings/country/get-by-id', { id });
        if (response.data.result === true) {
            setCountryData(response.data.message);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (open && id) {
            getCountry();
        }
    }, [open]);
    useEffect(() => {
        clearErrors();
        if (countryData) {
            reset({
                name: countryData?.name || '',
                shortname: countryData?.shortname || '',
                phoneCode: countryData?.phoneCode || '',
                isActive: countryData?.isActive || '',
            });
        }
    }, [countryData, open, reset]);
    const handleClose = () => {
        setOpen(false)
        // reset()
    };
    const handleUpdateCountry = async (data) => {
        if (isLoading) { return };
        setIsLoading(true);
        if (id) data.id = id;
        const { data: { result, message } } = await apiClient.post('/api/master-data-settings/country', data);
        if (result === true) {
            showToast(true, responseData.dataUpdated);
            handleCountryUpdate(message);
            setOpen(false);
            setApiErrors({});
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
                Edit Country
            </DialogTitle>
            <form onSubmit={handleSubmit(handleUpdateCountry)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                size={"small"}
                                label={<CustomInputLabel htmlFor='Country Name' text='Country Name' />}
                                placeholder='Eg: India'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('name', { required: registerData.countryNameReq })}
                                error={!!errors?.name || !!apiErrors?.name}
                                helperText={errors?.name?.message || apiErrors?.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='shortName' text='Short Name' />}
                                placeholder='Eg: IND'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                size={"small"}
                                {...register('shortname', { required: registerData.shortNameReq })}
                                error={Boolean(errors?.shortname) || !!apiErrors?.shortname}
                                helperText={errors?.shortname?.message || apiErrors?.shortname}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='shortName' text='Phone Code' />}
                                placeholder='Eg: 91'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                size={"small"}
                                {...register('phoneCode', { required: registerData.phnCodeReq })}
                                error={Boolean(errors?.phoneCode) || !!apiErrors?.phoneCode}
                                helperText={errors?.phoneCode?.message || apiErrors?.phoneCode}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='isActive'
                                rules={{ required: registerData.statusReq }}
                                control={control}
                                defaultValue='Y'
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='isActive'
                                        label={<CustomInputLabel htmlFor='activeStatus' text='Active Status' />}
                                        size="small"
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={!!apiErrors?.isActive}
                                        helperText={apiErrors?.isActive}
                                    >
                                        <MenuItem value='' disabled>
                                            Select Active Status
                                        </MenuItem>
                                        <MenuItem value='Y'>Yes</MenuItem>
                                        <MenuItem value='N'>No</MenuItem>
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

CountryDialog.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleCountryUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default CountryDialog
