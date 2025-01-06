'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextFieldStyled from '@core/components/mui/TextField';
import { Controller, useForm } from 'react-hook-form';
import { otherData, registerData, responseData, validations } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { base64ToFile, showToast } from '@/utils/helper';
// import { useSession } from "next-auth/react"
import { FormControl, FormHelperText } from '@mui/material';
import CustomInputLabel from '../../../../components/asterick/index';
import SubUserPermission from '@/utils/SubUserPermission';

const AccountDetails = () => {
    const [fileInput, setFileInput] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [isStateDisabled, setIsStateDisabled] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('');
    const { register, handleSubmit, formState: { errors }, control, setValue } = useForm();
    const defaultImage = '/images/avatars/1.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const fileLimit = `${otherData?.fileLimitText} (${otherData?.profileImgDim})`;
    const { accountSettingsPermission } = SubUserPermission();
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    setImgSrc(base64Data);
                    setFileInput(base64Data);
                };
                setApiErrors(prev => ({ ...prev, profileImage: '' }))
                reader.readAsDataURL(file);
            } else {
                setImgSrc(invalidImg);
                setApiErrors(prev => ({ ...prev, profileImage: responseData.invalidFileType }))
            }
        }
    };
    const handleProfileEdit = async (data) => {
        if (apiErrors.profileImage) {
            return;
        }
        delete data.companyName
        setIsButtonLoading(true);
        setApiErrors({});
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value === null ? "" : value);
        });
        const file = fileInput.split(',')[1];
        if (file) {
            const filename = 'image.png';
            const fileL = base64ToFile(fileInput, filename);
            formData.append('image', fileL);
        }

        const response = await apiClient.put('/api/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, responseData.profileUpdated);
            getUserProfile();
            setApiErrors({});
            setIsButtonLoading(false);
            window.location.reload();
        } else {
            setApiErrors(response.data.message);
            setIsButtonLoading(false);
        }
    };
    const getUserProfile = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/profile`);
        if (response.data.result === true) {
            const { name, email, companyName, contactNo, address, stateId, zipCode, countryId, image } = response.data.message;
            setValue('name', name);
            setValue('email', email);
            setValue('companyName', companyName);
            setValue('contactNo', contactNo);
            setValue('address', address);
            setValue('stateId', stateId);
            setValue('zipCode', zipCode);
            setValue('countryId', countryId);
            setSelectedCountry(countryId);
            setImgSrc(image);
        }
        setIsLoading(false);
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
    useEffect(() => {
        getUserProfile();
        getCountries();
    }, []);
    useEffect(() => {
        if (selectedCountry) {
            fetchStatesByCountryId(selectedCountry);
        } else {
            setStateData([]);
            setIsStateDisabled(true);
        }
    }, [selectedCountry]);
    const fetchStatesByCountryId = async (selectedCountry) => {
        try {
            const response = await apiClient.post('/api/master-data-settings/state/get-by-country-id', { countryId: selectedCountry });
            if (response.data.result === true) {
                setStateData(response.data.message);
                setIsStateDisabled(false);
            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        }
    };
    return (
        <Card>
            {isLoading && <div className='my-4'><Loader /></div>}
            {!isLoading && (
                <>
                    <CardContent>
                        <div className='flex max-sm:flex-col items-center gap-6'>
                            <img height={100} width={100} className='rounded' src={imgSrc || defaultImage} alt='Profile' />
                            {(accountSettingsPermission?.editPermission === "Y" || accountSettingsPermission?.writePermission === "Y") && (
                                <div className='flex flex-grow flex-col gap-4'>
                                    <div className='flex flex-col sm:flex-row gap-4'>
                                        <FormControl>
                                            <Button component='label' variant='contained' htmlFor='account-settings-upload-image' sx={{ position: 'relative', overflow: 'hidden' }}> Upload New Photo <input hidden type='file' accept='image/png, image/jpeg' onChange={handleFileInputChange} id='account-settings-upload-image' />
                                            </Button>
                                            {apiErrors?.profileImage && (
                                                <FormHelperText className='text-red-500'>
                                                    {apiErrors?.profileImage}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </div>
                                    <Typography>{fileLimit}</Typography>
                                </div>
                            )}
                        </div>
                        <Divider className='mbs-4' />
                    </CardContent>
                    <CardContent>
                        <form autoComplete='off' onSubmit={handleSubmit(handleProfileEdit)}>
                            <Grid container spacing={6}>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='name' text='Name' />}
                                        placeholder='John'
                                        error={!!errors?.name || apiErrors?.name}
                                        helperText={errors?.name?.message || apiErrors?.name}
                                        {...register('name', { required: registerData.nameReq, validate: value => value.trim() !== '' || registerData.nameReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='email' text='Email' />}
                                        disabled
                                        placeholder='john.doe@gmail.com'
                                        {...register('email', {
                                            required: registerData.emailReq,
                                            pattern: {
                                                value: validations.emailPattern,
                                                message: registerData.emailValMsg
                                            }
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='companyName' text='Company Name' />}
                                        disabled
                                        placeholder='Company Name'
                                        {...register('companyName')}
                                        error={apiErrors?.companyName}
                                        helperText={apiErrors?.companyName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='phoneNumber' text='Phone Number' />}
                                        placeholder='9876543210'
                                        {...register("contactNo", { required: registerData.mobReq })}
                                        error={!!errors?.contactNo || !!apiErrors?.contactNo}
                                        helperText={errors?.contactNo?.message || apiErrors?.contactNo}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name='countryId'
                                        rules={{ required: registerData.countryNameReq }}
                                        control={control}
                                        defaultValue=''
                                        render={({ field }) => (
                                            <TextFieldStyled
                                                select
                                                fullWidth
                                                id='select-country'
                                                label={<CustomInputLabel htmlFor='celect-country' text='Select Country' />}
                                                size="small"
                                                variant='filled'
                                                InputLabelProps={{ shrink: true }}
                                                {...field}
                                                error={!!errors?.countryId || !!apiErrors?.countryId}
                                                helperText={errors?.countryId?.message || apiErrors?.countryId}
                                                onChange={(event) => {
                                                    setSelectedCountry(event.target.value);
                                                    field.onChange(event);
                                                }}
                                            >
                                                <MenuItem value='' disabled>
                                                    Select a country
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
                                        rules={{ required: registerData.stateNameReq }}
                                        control={control}
                                        defaultValue=''
                                        render={({ field }) => (
                                            <TextFieldStyled
                                                select
                                                fullWidth
                                                id='select-state'
                                                label={<CustomInputLabel htmlFor='celect-state' text='Select State' />}
                                                size="small"
                                                variant='filled'
                                                InputLabelProps={{ shrink: true }}
                                                {...field}
                                                error={errors?.stateId || !!apiErrors?.stateId}
                                                helperText={errors?.stateId?.message || apiErrors?.stateId}
                                                disabled={isStateDisabled}
                                            >
                                                <MenuItem value='' disabled>
                                                    Select a state
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
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label='Address'
                                        placeholder='Address'
                                        {...register('address')}
                                        error={!!apiErrors?.address}
                                        helperText={apiErrors?.address}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label='Zip Code'
                                        placeholder='123456'
                                        {...register('zipCode')}
                                        error={!!apiErrors?.zipCode}
                                        helperText={apiErrors?.zipCode}
                                    />
                                </Grid>
                                <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                    {(accountSettingsPermission?.editPermission === "Y" || accountSettingsPermission?.writePermission === "Y") && (
                                        <Button variant='contained' type='submit'>
                                            {isButtonLoading ? <Loader type="btnLoader" /> : "Save Changes"}
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </>)
            }
        </Card>
    )
}

export default AccountDetails
