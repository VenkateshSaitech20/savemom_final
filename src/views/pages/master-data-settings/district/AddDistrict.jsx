import React, { useCallback, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, Grid } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { showToast } from '@/utils/helper';
const AddDistrict = props => {
    const { open, handleClose, handleDistrictAdded } = props;
    const [apiErrors, setApiErrors] = useState({});
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isStateDisabled, setIsStateDisabled] = useState(true);
    const [isCityDisabled, setIsCityDisabled] = useState(true);
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm();
    const { masterSettingsPermission } = SubUserPermission();
    const handleReset = () => {
        handleClose()
        setApiErrors({});
        reset();
    };
    const getCountries = useCallback(async () => {
        const response = await apiClient.get("/api/master-data-settings/country");
        if (response.data.result === true) {
            setCountryData(response.data.message);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    }, []);
    useEffect(() => {
        getCountries();
    }, []);
    const handleStates = (selectedCountry) => {
        fetchStatesByCountryId(selectedCountry);
        setCityData([]);
        setIsCityDisabled(true);
    };
    const fetchStatesByCountryId = useCallback(async (selectedCountry) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/state/get-by-country-id', { countryId: selectedCountry });
            if (response.data.result === true) {
                setStateData(response.data.message);
                setIsStateDisabled(false);
            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        }
    }, []);
    const handleCities = (selectedState) => {
        fetchCitiesByStateId(selectedState);
    };
    const fetchCitiesByStateId = useCallback(async (selectedState) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/city/get-cities-by-state-id', { stateId: selectedState });
            if (response.data.result === true) {
                setCityData(response.data.message);
                setIsCityDisabled(false);
            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        }
    }, []);
    const handleDistrictSubmit = async (data) => {
        setApiErrors({});
        setIsButtonLoading(true);
        const response = await apiClient.post('/api/master-data-settings/district', data);
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handleDistrictAdded();
            setApiErrors({});
            setIsButtonLoading(false);
            handleClose();
            reset();
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(response.data.message)
            }
        }
        setIsButtonLoading(false);
    };
    return (
        <Drawer
            open={open}
            anchor='right'
            variant='temporary'
            onClose={handleReset}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
        >
            <div className='flex items-center justify-between p-6'>
                <Typography variant='h5'>Add City / Town</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleDistrictSubmit)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12}>
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
                            <Grid item xs={12}>
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
                            <Grid item xs={12}>
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
                                            error={!!errors.cityId || apiErrors?.cityId}
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
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='name' text='City/Town' />}
                                    placeholder='City/Town Name'
                                    error={!!errors.name || apiErrors?.name}
                                    helperText={errors?.name?.message || apiErrors?.name}
                                    {...register('name', { required: registerData.cityNameReq, validate: value => value.trim() !== '' || registerData.cityNameReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='lgdCode' text='LGD code' />}
                                    placeholder='LGD code'
                                    error={!!errors.lgdCode || apiErrors?.lgdCode}
                                    helperText={errors?.lgdCode?.message || apiErrors?.lgdCode}
                                    {...register('lgdCode', { required: registerData.lgdCodeNameReq, validate: value => value.trim() !== '' || registerData.lgdCodeNameReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name='isActive'
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
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(masterSettingsPermission?.editPermission === "Y" || masterSettingsPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Add City/Town"}
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </div>
        </Drawer>
    )
}
AddDistrict.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handleDistrictAdded: PropTypes.func,
};
export default React.memo(AddDistrict)
