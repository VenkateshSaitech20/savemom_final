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
const StateDialog = ({ open, setOpen, data, id, handleStateUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState({});
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm();
    const getCountry = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/master-data-settings/country');
        if (response.data.result === true) {
            setCountryData(response.data.message);
            setIsLoading(false);
        }
    };
    const getState = async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/master-data-settings/state/get-by-id', { id });
        if (response.data.result === true) {
            setStateData(response.data.message);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (open && id) {
            getCountry();
            getState();
        }
    }, [open]);
    useEffect(() => {
        if (stateData) {
            reset({
                name: stateData?.name || '',
                countryId: stateData?.countryId || '',
                lgdCode: stateData?.lgdCode || '',
                isActive: stateData?.isActive || '',
            });
        }
    }, [stateData, open, reset]);
    const handleClose = () => {
        setOpen(false)
        // reset()
    };
    const handleStateCountry = async (data) => {
        setIsLoading(true);
        if (id) data.id = id;
        const { data: { result, message } } = await apiClient.post('/api/master-data-settings/state', data);
        if (result === true) {
            showToast(true, responseData.dataUpdated);
            handleStateUpdate(message);
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
                Edit State
            </DialogTitle>
            <form onSubmit={handleSubmit(handleStateCountry)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='countryId'
                                control={control}
                                defaultValue=''
                                rules={{ required: registerData.countryNameReq }}
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='countryId'
                                        label={<CustomInputLabel htmlFor='countryName' text='Country Name' />}
                                        size="small"
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={!!errors.countryId || apiErrors?.countryId}
                                        helperText={errors?.countryId?.message || apiErrors?.countryId}
                                    >
                                        <MenuItem value='' disabled>
                                            Select Country
                                        </MenuItem>
                                        {countryData?.map((country) => (
                                            <MenuItem value={country.id} key={country.id}>
                                                {country.name}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                size="small"
                                label={<CustomInputLabel htmlFor='state' text='State Name' />}
                                placeholder='Eg: India'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('name', { required: registerData.stateNameReq })}
                                error={!!errors?.name || !!apiErrors?.name}
                                helperText={errors?.name?.message || apiErrors?.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                size="small"
                                label={<CustomInputLabel htmlFor='lgdCode' text='LGD Code' />}
                                placeholder='Eg: 25'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('lgdCode', { required: registerData.lgdCodeNameReq })}
                                error={!!errors?.lgdCode || !!apiErrors?.lgdCode}
                                helperText={errors?.lgdCode?.message || apiErrors?.lgdCode}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='isActive'
                                control={control}
                                rules={{ required: registerData.statusReq }}
                                defaultValue='Y'
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='isActive'
                                        label='Active Status'
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

StateDialog.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleStateUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default StateDialog
