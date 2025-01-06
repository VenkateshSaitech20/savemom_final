'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm } from 'react-hook-form';
import { otherData, registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { base64ToFile, showToast } from '@/utils/helper';
import { FormControl, FormHelperText } from '@mui/material';
import CustomInputLabel from '@/components/asterick';
import SubUserPermission from '@/utils/SubUserPermission';

const SystemDetails = () => {
    const [fileInputSystemLogo, setFileInputSystemLogo] = useState('');
    const [fileInputNavbarLogo, setFileInputNavbarLogo] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [systemImgSrc, setSystemImgSrc] = useState('');
    const [navImgSrc, setNavImgSrc] = useState('');
    const [id, setId] = useState('');
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const defaultImage = '/images/logos/pregnant.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const favIconLimitText = `${otherData?.fileLimitText} (${otherData?.favIconDim})`;
    const systemLimitText = `${otherData?.fileLimitText} (${otherData?.systemImgDim})`;
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const { systemSettingsPermission } = SubUserPermission();

    const handleFileInputChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    if (type === 'system') {
                        setSystemImgSrc(base64Data);
                        setFileInputSystemLogo(base64Data);
                    } else if (type === 'navbar') {
                        setNavImgSrc(base64Data);
                        setFileInputNavbarLogo(base64Data);
                    }
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else {
                if (type === 'system') {
                    setSystemImgSrc(invalidImg);
                    setApiErrors(prev => ({ ...prev, systemImage: responseData.invalidFileType }));
                } else if (type === 'navbar') {
                    setNavImgSrc(invalidImg);
                    setApiErrors(prev => ({ ...prev, navbarImage: responseData.invalidFileType }));
                }
            }
        }
    };
    const handleSystemSettingEdit = async (data) => {
        if (apiErrors.systemImage || apiErrors.navbarImage) {
            return;
        }
        setApiErrors({});
        setIsButtonLoading(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value === null ? "" : value);
        });
        if (fileInputSystemLogo) {
            const filenameSystem = 'system-logo.png';
            const fileSystem = base64ToFile(fileInputSystemLogo, filenameSystem);
            formData.append('systemImage', fileSystem || systemImgSrc);
        }
        if (fileInputNavbarLogo) {
            const filenameNavbar = 'navbar-logo.png';
            const fileNavbar = base64ToFile(fileInputNavbarLogo, filenameNavbar);
            formData.append('navbarImage', fileNavbar || navImgSrc);
        };
        if (id) formData.append('id', id);
        const response = await apiClient.post('/api/system-settings', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            window.location.reload();
            setApiErrors({});
            setIsButtonLoading(false);
        } else {
            setApiErrors(response.data.message);
            setIsButtonLoading(false);
        }
    }
    const getSystemSetting = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/system-settings`);
        if (response.data.result === true) {
            const { id, systemName, description, metaTitle, email, contactNo, systemImage, navbarImage } = response.data.message;
            setValue('systemName', systemName);
            setValue('description', description);
            setValue('metaTitle', metaTitle);
            setValue('email', email);
            setValue('contactNo', contactNo);
            setSystemImgSrc(systemImage);
            setNavImgSrc(navbarImage);
            setId(id);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getSystemSetting();
    }, []);

    return (
        <Card>
            {isLoading && <div className='my-4'><Loader /></div>}
            {!isLoading && (
                <>
                    <CardContent>
                        <div className='flex max-sm:flex-col items-center gap-6'>
                            <img height={100} width={100} className='rounded' src={systemImgSrc || defaultImage} alt='Logo' />
                            {(systemSettingsPermission?.editPermission === "Y" || systemSettingsPermission?.writePermission === "Y") && (
                                <div className='flex flex-grow flex-col gap-4'>
                                    <div className='flex flex-col sm:flex-row gap-4'>
                                        <FormControl>
                                            <Button component='label' variant='contained' htmlFor='system-settings-upload-logo'>
                                                Upload Favicon Image
                                                <input
                                                    hidden
                                                    type='file'
                                                    accept='image/png, image/jpeg'
                                                    onChange={(e) => { handleFileInputChange(e, 'system') }}
                                                    id='system-settings-upload-logo'
                                                />
                                            </Button>
                                            {apiErrors?.systemImage && (
                                                <FormHelperText className='text-red-500'>
                                                    {apiErrors?.systemImage}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </div>
                                    <Typography>{favIconLimitText}</Typography>
                                </div>
                            )}
                            <img height={100} width={100} className='rounded' src={navImgSrc || defaultImage} alt='Logo' />
                            {(systemSettingsPermission?.editPermission === "Y" || systemSettingsPermission?.writePermission === "Y") && (
                                <div className='flex flex-grow flex-col gap-4'>
                                    <div className='flex flex-col sm:flex-row gap-4'>
                                        <FormControl>
                                            <Button component='label' variant='contained' htmlFor='navbar-upload-logo'>
                                                Upload System Image
                                                <input
                                                    hidden
                                                    type='file'
                                                    accept='image/png, image/jpeg'
                                                    onChange={(e) => { handleFileInputChange(e, 'navbar') }}
                                                    id='navbar-upload-logo'
                                                />
                                            </Button>
                                            {apiErrors?.navbarImage && (
                                                <FormHelperText className='text-red-500'>
                                                    {apiErrors?.navbarImage}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </div>
                                    <Typography>{systemLimitText}</Typography>
                                </div>
                            )}
                        </div>
                        <Divider className='mbs-4' />
                    </CardContent>
                    <CardContent>
                        <form autoComplete='off' onSubmit={handleSubmit(handleSystemSettingEdit)}>
                            <Grid container spacing={6}>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='system-name' text='System Name' />}
                                        placeholder='Savemom'
                                        error={!!errors.systemName || apiErrors?.systemName}
                                        helperText={errors?.systemName?.message || apiErrors?.systemName}
                                        {...register('systemName', { required: registerData.systemNameReq, validate: value => value.trim() !== '' || registerData.systemNameReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='meta-title' text='Meta Title' />}
                                        placeholder='Meta Title'
                                        error={!!errors.metaTitle || apiErrors?.metaTitle}
                                        helperText={errors?.metaTitle?.message || apiErrors?.metaTitle}
                                        {...register('metaTitle', { required: registerData.metaTitleReq, validate: value => value.trim() !== '' || registerData.metaTitleReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='email' text='Email' />}
                                        placeholder='Email'
                                        error={!!errors.email || apiErrors?.email}
                                        helperText={errors?.email?.message || apiErrors?.email}
                                        {...register('email', { required: registerData.emailReq, validate: value => value.trim() !== '' || registerData.emailReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='phone-number' text='Phone Number' />}
                                        placeholder='9876543210'
                                        error={!!errors.contactNo || apiErrors?.contactNo}
                                        helperText={errors?.contactNo?.message || apiErrors?.contactNo}
                                        {...register('contactNo', { required: registerData.phoneReq, validate: value => value.trim() !== '' || registerData.phoneReq })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='meta-description' text='Meta Description' />}
                                        multiline="true"
                                        rows={3}
                                        placeholder='Meta Description'
                                        error={!!errors.description || apiErrors?.description}
                                        helperText={errors?.description?.message || apiErrors?.description}
                                        {...register('description', { required: registerData.metaDescriptionReq, validate: value => value.trim() !== '' || registerData.metaDescriptionReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                    {(systemSettingsPermission?.editPermission === "Y" || systemSettingsPermission?.writePermission === "Y") && (
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

export default SystemDetails
