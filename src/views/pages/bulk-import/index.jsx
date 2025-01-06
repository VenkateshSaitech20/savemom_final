'use client'
import Loader from '@/components/loader';
import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import { Typography, Card, CardHeader, CardContent, Button, Grid, MenuItem } from '@mui/material';
import TextFieldStyled from '@/@core/components/mui/TextField';
import { Controller, useForm } from 'react-hook-form';
import CustomInputLabel from '@/components/asterick';
import { registerData, responseData } from '@/utils/message';

const BulkImport = () => {
    const [fileInput, setFileInput] = useState('');
    const [userErr, setUserErr] = useState('');
    const [countryErr, setCountryErr] = useState('');
    const [stateErr, setStateErr] = useState('');
    const [districtErr, setDistrictErr] = useState('');
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [buttonId, setButtonId] = useState('0');
    const [countryData, setCountryData] = useState([]);
    const [districtStateData, setDistrictStateData] = useState([]);
    const [cityStateData, setCityStateData] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [apiErrors, setApiErrors] = useState({});

    const [disabledFields, setDisabledFields] = useState({
        districtState: true,
        cityState: true,
        cityDistrict: true
    });
    const { control: stateControl, handleSubmit: handleStateSubmit, formState: { errors: stateErrors }, watch: watchState, setValue: setStateValue, clearErrors: stateClearErrors } = useForm();
    const { control: districtControl, handleSubmit: handleDistrictSubmit, formState: { errors: districtErrors }, watch: watchDistrict, setValue: setDistrictValue, clearErrors: districtClearErrors } = useForm();
    const { control: cityControl, handleSubmit: handleCitySubmit, formState: { errors: cityErrors }, watch: watchCity, setValue: setCityValue, clearErrors: cityClearErrors } = useForm();

    const districtCountryId = watchDistrict('districtCountryId');
    const cityCountryId = watchCity('cityCountryId');
    const cityStateId = watchCity('cityStateId');
    const countryId = watchState('countryId');

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
    };
    //For User Bulk
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setUserErr('');
        if (buttonId !== "0") { return };
        setButtonId('1');
        setIsButtonLoading(true);
        const formData = new FormData();
        formData.append("file", fileInput);
        const response = await apiClient.post('/api/bulk-import/import-users', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setUserErr(response.data.message);
        }
        setButtonId('0');
        setIsButtonLoading(false);
    };
    //For Country Bulk
    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        if (buttonId !== "0") { return };
        setCountryErr('');
        setButtonId('2');
        setIsButtonLoading(true);
        const formData = new FormData();
        formData.append("file", fileInput);
        const response = await apiClient.post(`/api/bulk-import/import-countries`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setCountryErr(response.data.message);
        }
        setButtonId('0');
        setIsButtonLoading(false);
    };
    //For State Bulk
    const handleStateSubmitC = async (data) => {
        setApiErrors({});
        if (buttonId !== "0") { return };
        setStateErr('');
        setButtonId('3');
        setIsButtonLoading(true);
        const formData = new FormData();
        formData.append('countryId', data.countryId)
        formData.append("file", fileInput);
        const response = await apiClient.post('/api/bulk-import/import-states', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response?.data?.result === true) {
            showToast(true, response.data.message);
            setApiErrors({});
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setApiErrors(response.data.message);
        }
        setButtonId('0');
        setIsButtonLoading(false);
    };
    //For City Bulk
    const handleCitySubmitC = async (data) => {
        setApiErrors({});
        if (buttonId !== "0") { return };
        setButtonId('5');
        setIsButtonLoading(true);
        const formData = new FormData();

        formData.append("file", fileInput);
        formData.append('countryId', data.cityCountryId)
        formData.append('stateId', data.cityStateId)
        formData.append('cityId', data.cityDistrictId)
        const response = await apiClient.post('/api/bulk-import/import-districts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setApiErrors(response.data.message)
        }
        setButtonId('0');
        setIsButtonLoading(false);
    };
    //For District Bulk
    const handleDistrictSubmitC = async (data) => {
        if (buttonId !== "0") { return };
        setDistrictErr('');
        setButtonId('4');
        setIsButtonLoading(true);
        const formData = new FormData();
        formData.append("file", fileInput);
        formData.append('countryId', data.districtCountryId)
        formData.append('stateId', data.districtStateId)
        const response = await apiClient.post('/api/bulk-import/import-cities', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setApiErrors(response.data.message)
            setDistrictErr(response.data.message);
        }
        setButtonId('0');
        setIsButtonLoading(false);
    };
    const handleExport = async (fileType) => {
        try {
            const response = await apiClient.post('/api/bulk-import/export-excel', { fileType }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            if (fileType === "districts") {
                fileType = "districts";
            } else if (fileType === "cities") {
                fileType = "cities";
            }
            link.setAttribute('download', `${fileType}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };
    const getCountries = async () => {
        const response = await apiClient.get("/api/master-data-settings/country");
        if (response.data.result === true) {
            setCountryData(response.data.message);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    };

    const fetchStatesByDistrictCountryId = async (countryId) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/state/get-by-country-id', { countryId });
            if (response.data.result === true) {
                setDistrictStateData(response.data.message);
                setDisabledFields({ cityState: false });
            }
        } catch (error) {
            console.error('Failed to fetch states for district country:', error);
        }
    };

    const fetchStatesByCityCountryId = async (countryId) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/state/get-by-country-id', { countryId });
            if (response.data.result === true) {
                setCityStateData(response.data.message);
                setDisabledFields({ districtState: false });
            }
        } catch (error) {
            console.error('Failed to fetch states for city country:', error);
        }
    };

    const fetchCitiesByStateId = async (id) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/city/get-cities-by-state-id', { stateId: id });
            if (response.data.result === true) {
                setCityData(response.data.message);
                setIsCityDisabled(false);
            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        }
    };
    useEffect(() => {
        getCountries();
    }, []);
    useEffect(() => {
        if (districtCountryId) {
            setCityData([]);
            setCityStateData([]);
            setDistrictValue('districtStateId', undefined);
            setCityValue('cityCountryId', undefined);
            setCityValue('cityDistricteId', undefined);
            setStateValue('countryId', undefined);
            stateClearErrors()
            cityClearErrors()
            fetchStatesByDistrictCountryId(districtCountryId);
        }
    }, [districtCountryId])
    useEffect(() => {
        if (cityCountryId) {
            setDistrictStateData([]);
            setDistrictValue('districtCountryId', undefined);
            setDistrictValue('districtStateId', undefined);
            setStateValue('countryId', undefined);
            districtClearErrors();
            fetchStatesByCityCountryId(cityCountryId);
        }
    }, [cityCountryId]);

    useEffect(() => {
        if (countryId) {
            setDistrictStateData([]);
            setDistrictValue('districtCountryId', undefined);
            setDistrictValue('districtStateId', undefined);
            setCityValue('cityCountryId', undefined);
            setCityValue('cityDistrictId', undefined);
            setCityStateData([]);
            cityClearErrors();
            districtClearErrors();
        }
    }, [countryId]);
    useEffect(() => {
        if (cityStateId) {
            setDistrictStateData([]);
            fetchCitiesByStateId(cityStateId);
        }
    }, [cityStateId]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card className='h-full'>
                    <CardHeader title='Users' />
                    <CardContent>
                        <div className='flex flex-col justify-between mb-4'>
                            <div className='flex flex-col items-start'>
                                <form onSubmit={handleUserSubmit}>
                                    <input type="file" className="mb-3" accept=".xlsx, .xls" onChange={handleFileChange} />
                                    <div className='flex justify-between'>
                                        <Button size="small" variant='contained' type='submit'>{(isButtonLoading && buttonId === "1") ? <Loader type="btnLoader" /> : "Upload"}</Button>
                                        <div className="flex">
                                            <Button size="small" variant='contained' startIcon={<i className='bx-download' />} onClick={() => handleExport('users')}> Download</Button>
                                        </div>
                                    </div>
                                </form>
                                {userErr && <Typography className='text-red-500 mt-2'>{userErr}</Typography>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card className='h-full'>
                    <CardHeader title='Countries' />
                    <CardContent>
                        <div className='flex flex-col justify-between mb-4'>
                            <div className='flex flex-col items-start'>
                                <form onSubmit={handleCountrySubmit}>
                                    <input type="file" className="mb-3" accept=".xlsx, .xls" onChange={handleFileChange} />
                                    <div className='flex justify-between'>
                                        <Button size="small" variant='contained' type='submit'>{(isButtonLoading && buttonId === "2") ? <Loader type="btnLoader" /> : "Upload"}</Button>
                                        <Button size="small" variant='contained' style={{ width: '50%' }} startIcon={<i className='bx-download' />} onClick={() => handleExport('countries')}> Download</Button>
                                    </div>
                                </form>
                                {countryErr && <Typography className='text-red-500 mt-2'>{countryErr}</Typography>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card className='h-full'>
                    <CardHeader title='States' />
                    <CardContent>
                        <div className='flex flex-col justify-between mb-4'>
                            <div className='flex flex-col items-start'>
                                <form onSubmit={handleStateSubmit(handleStateSubmitC)}>
                                    <Grid item xs={12} className='mb-2'>
                                        <Controller
                                            name='countryId'
                                            control={stateControl}
                                            defaultValue=""
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
                                                    error={!!stateErrors?.countryId}
                                                    helperText={stateErrors?.countryId?.message || ""}
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
                                    <input type="file" className="mb-3" accept=".xlsx, .xls" onChange={handleFileChange} />
                                    <div className='flex justify-between'>
                                        <Button size="small" variant='contained' type='submit'>{(isButtonLoading && buttonId === "3") ? <Loader type="btnLoader" /> : "Upload"}</Button>
                                        <Button size="small" variant='contained' style={{ width: '50%' }} startIcon={<i className='bx-download' />} onClick={() => handleExport('states')}> Download</Button>
                                    </div>

                                </form>
                                {stateErr && <Typography className='text-red-500 mt-2'>{stateErr}</Typography>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card className='h-full'>
                    <CardHeader title='Districts' />
                    <CardContent>
                        <div className='flex flex-col justify-between mb-4'>
                            <div className='flex flex-col items-start'>
                                <form onSubmit={handleDistrictSubmit(handleDistrictSubmitC)}>
                                    <Grid item xs={12} className='mb-2'>
                                        <Controller
                                            name='districtCountryId'
                                            control={districtControl}
                                            defaultValue=''
                                            rules={{ required: registerData.countryNameReq }}
                                            render={({ field }) => (
                                                <TextFieldStyled
                                                    select
                                                    fullWidth
                                                    id='districtCountryId'
                                                    label={<CustomInputLabel htmlFor='countryName' text='Country Name' />}
                                                    size="small"
                                                    variant='filled'
                                                    InputLabelProps={{ shrink: true }}
                                                    {...field}
                                                    error={!!districtErrors?.districtCountryId || apiErrors?.districtCountryId}
                                                    helperText={districtErrors?.districtCountryId?.message || apiErrors?.districtCountryId}
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
                                    <Grid item xs={12} className='mb-2'>
                                        <Controller
                                            name='districtStateId'
                                            control={districtControl}
                                            defaultValue=''
                                            rules={{ required: registerData.stateNameReq }}
                                            render={({ field }) => (
                                                <TextFieldStyled
                                                    select
                                                    fullWidth
                                                    id='districtStateId'
                                                    label={<CustomInputLabel htmlFor='stateName' text='State Name' />}
                                                    size="small"
                                                    variant='filled'
                                                    InputLabelProps={{ shrink: true }}
                                                    {...field}
                                                    error={!!districtErrors?.districtStateId || apiErrors?.districtStateId}
                                                    helperText={districtErrors?.districtStateId?.message || apiErrors?.districtStateId}
                                                >
                                                    <MenuItem value='' disabled>
                                                        Select State
                                                    </MenuItem>
                                                    {districtStateData?.map((state) => (
                                                        <MenuItem disabled={disabledFields.districtState} value={state.id} key={state.id}>
                                                            {state.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextFieldStyled>
                                            )}
                                        />
                                    </Grid>
                                    <input type="file" className="mb-3" accept=".xlsx, .xls" onChange={handleFileChange} />
                                    <div className='flex justify-between'>
                                        <Button size="small" variant='contained' type='submit'>{(isButtonLoading && buttonId === "4") ? <Loader type="btnLoader" /> : "Upload"}</Button>
                                        <Button size="small" variant='contained' style={{ width: '50%' }} startIcon={<i className='bx-download' />} onClick={() => handleExport('districts')}> Download</Button>
                                    </div>
                                </form>
                                {districtErr && <Typography className='text-red-500 mt-2'>{districtErr}</Typography>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card className='h-full'>
                    <CardHeader title='City' />
                    <CardContent>
                        <div className='flex flex-col justify-between mb-4'>
                            <div className='flex flex-col items-start'>
                                <form onSubmit={handleCitySubmit(handleCitySubmitC)}>
                                    <Grid item xs={12} className='mb-2'>
                                        <Controller
                                            name='cityCountryId'
                                            control={cityControl}
                                            defaultValue=''
                                            rules={{ required: registerData.countryNameReq }}
                                            render={({ field }) => (
                                                <TextFieldStyled
                                                    select
                                                    fullWidth
                                                    id='cityCountryId'
                                                    label={<CustomInputLabel htmlFor='countryName' text='Country Name' />}
                                                    size="small"
                                                    variant='filled'
                                                    InputLabelProps={{ shrink: true }}
                                                    {...field}
                                                    error={!!cityErrors?.cityCountryId || apiErrors?.cityCountryId}
                                                    helperText={cityErrors?.cityCountryId?.message || apiErrors?.cityCountryId}
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
                                    <Grid item xs={12} className='mb-2'>
                                        <Controller
                                            name='cityStateId'
                                            control={cityControl}
                                            defaultValue=''
                                            rules={{ required: registerData.stateNameReq }}
                                            render={({ field }) => (
                                                <TextFieldStyled
                                                    select
                                                    fullWidth
                                                    id='cityStateId'
                                                    label={<CustomInputLabel htmlFor='stateName' text='State Name' />}
                                                    size="small"
                                                    variant='filled'
                                                    InputLabelProps={{ shrink: true }}
                                                    {...field}
                                                    error={!!cityErrors.cityStateId || apiErrors.cityStateId}
                                                    helperText={cityErrors?.cityStateId?.message || apiErrors.cityStateId}
                                                >
                                                    <MenuItem value='' disabled>
                                                        Select State
                                                    </MenuItem>
                                                    {cityStateData?.map((state) => (
                                                        <MenuItem disabled={disabledFields.cityState} value={state.id} key={state.id}>
                                                            {state.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextFieldStyled>
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} className='mb-2'>
                                        <Controller
                                            name='cityDistrictId'
                                            control={cityControl}
                                            defaultValue=''
                                            rules={{ required: registerData.districtNameReq }}
                                            render={({ field }) => (
                                                <TextFieldStyled
                                                    select
                                                    fullWidth
                                                    id='cityDistricteId'
                                                    label={<CustomInputLabel htmlFor='districtName' text='District Name' />}
                                                    size="small"
                                                    variant='filled'
                                                    InputLabelProps={{ shrink: true }}
                                                    {...field}
                                                    error={!!cityErrors.cityDistrictId || apiErrors.cityDistrictId}
                                                    helperText={cityErrors?.cityDistrictId?.message || apiErrors.cityDistrictId}
                                                >
                                                    <MenuItem value='' disabled>
                                                        Select District
                                                    </MenuItem>
                                                    {cityData?.map((district) => (
                                                        <MenuItem disabled={disabledFields.cityDistrict} value={district.id} key={district.id}>
                                                            {district.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextFieldStyled>
                                            )}
                                        />
                                    </Grid>
                                    <input type="file" className="mb-3" accept=".xlsx, .xls" onChange={handleFileChange} />
                                    <div className='flex justify-between'>
                                        <Button size="small" variant='contained' type='submit'>{(isButtonLoading && buttonId === "5") ? <Loader type="btnLoader" /> : "Upload"}</Button>
                                        <Button size="small" variant='contained' style={{ width: '50%' }} startIcon={<i className='bx-download' />} onClick={() => handleExport('cities')}> Download</Button>
                                    </div>
                                </form>
                                {apiErrors?.cityErr && <Typography className='text-red-500 mt-2'>{apiErrors.cityErr}</Typography>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        </Grid >
    )
}

export default BulkImport;
