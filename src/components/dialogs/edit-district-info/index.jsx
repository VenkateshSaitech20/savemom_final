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
const DistrictDialog = ({ open, setOpen, data, id, handleDistrictUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [districtData, setDistrictData] = useState({});
    const [isStateDisabled, setIsStateDisabled] = useState(true);
    const [isCityDisabled, setIsCityDisabled] = useState(true);
    const { register, handleSubmit, formState: { errors }, control, setValue, reset } = useForm();
    const getCountry = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/master-data-settings/country');
        if (response.data.result === true) {
            setCountryData(response.data.message);
            setIsLoading(false);
        }
    };
    const getDistrict = async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/master-data-settings/district/get-by-id', { id });
        if (response.data.result === true) {
            setDistrictData(response.data.message);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (open && id) {
            getCountry();
            getDistrict();
        }
    }, [open]);
    useEffect(() => {
        if (districtData) {
            fetchStatesByCountryId(districtData?.countryId);
            fetchCitiesByStateId(districtData?.stateId);
            reset({
                name: districtData?.name || '',
                countryId: districtData?.countryId || '',
                stateId: districtData?.stateId || '',
                cityId: districtData?.cityId || '',
                lgdCode: districtData?.lgdCode || '',
                isActive: districtData?.isActive || '',
            });
        }
    }, [districtData, open, reset]);
    const handleStates = (selectedCountryId) => {
        setValue("stateId", null);
        setCityData([]);
        setIsCityDisabled(false);
        fetchStatesByCountryId(selectedCountryId);
    };
    const fetchStatesByCountryId = async (selectedCountry) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/state/get-by-country-id', { countryId: selectedCountry });
            if (response.data.result === true) {
                if (response.data.message.length > 0) {
                    setStateData(response.data.message);
                    setIsStateDisabled(false);
                } else {
                    setStateData([]);
                    setIsStateDisabled(false);
                }

            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        }
    };
    const handleCities = (selectedStateId) => {
        setValue("cityId", null);
        fetchCitiesByStateId(selectedStateId);
    };
    const fetchCitiesByStateId = async (selectedState) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/city/get-cities-by-state-id', { stateId: selectedState });
            if (response.data.result === true) {
                if (response.data.message.length > 0) {
                    setCityData(response.data.message);
                    setIsCityDisabled(false);
                } else {
                    setCityData([]);
                    setIsCityDisabled(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        }
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleDistrictSubmit = async (data) => {
        setIsLoading(true);
        if (id) data.id = id;
        const { data: { result, message } } = await apiClient.post('/api/master-data-settings/district', data);
        if (result === true) {
            showToast(true, responseData.dataUpdated);
            handleDistrictUpdate(message);
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
                Edit City/Town
            </DialogTitle>
            <form onSubmit={handleSubmit(handleDistrictSubmit)}>
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
                                        onChange={(event) => {
                                            handleStates(event.target.value);
                                            field.onChange(event);
                                        }}
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
                            <Controller
                                name='stateId'
                                control={control}
                                defaultValue=''
                                rules={{ required: registerData.stateNameReq }}
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='stateId'
                                        label={<CustomInputLabel htmlFor='stateName' text='State Name' />}
                                        size="small"
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={!!errors.stateId || apiErrors?.stateId}
                                        helperText={errors?.stateId?.message || apiErrors?.stateId}
                                        disabled={isStateDisabled}
                                        onChange={(event) => {
                                            handleCities(event.target.value);
                                            field.onChange(event);
                                        }}
                                    >
                                        <MenuItem value='' disabled>
                                            Select State
                                        </MenuItem>
                                        {stateData?.map((state) => (
                                            <MenuItem value={state.id} key={state.id}>
                                                {state.name}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='cityId'
                                control={control}
                                defaultValue=''
                                rules={{ required: registerData.districtNameReq }}
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='cityId'
                                        label={<CustomInputLabel htmlFor='districtName' text='District Name' />}
                                        size="small"
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={!!errors.cityId || apiErrors?.stateIcityIdd}
                                        helperText={errors?.cityId?.message || apiErrors?.cityId}
                                        disabled={isCityDisabled}
                                    >
                                        <MenuItem value='' disabled>
                                            Select City
                                        </MenuItem>
                                        {cityData?.map((city) => (
                                            <MenuItem value={city.id} key={city.id}>
                                                {city.name}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='cityName' text='City/Village Name' />}
                                size="small"
                                placeholder='Eg: Vadipatti'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('name', { required: registerData.cityNameReq })}
                                error={!!errors?.name || !!apiErrors?.name}
                                helperText={errors?.name?.message || apiErrors?.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='cityName' text='LGD Code' />}
                                size="small"
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
                                defaultValue='Y'
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='isActive'
                                        label={<CustomInputLabel htmlFor='activStatus' text='Active Status' />}
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

DistrictDialog.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleDistrictUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default DistrictDialog
