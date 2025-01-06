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
import { FormControl, FormControlLabel, FormGroup, FormHelperText, Switch } from '@mui/material';
import CustomInputLabel from '@/components/asterick';
import SubUserPermission from '@/utils/SubUserPermission';
const WebsiteDetails = () => {
    const [fileDashboardLight, setFileDashboardLight] = useState('');
    const [fileDashboardDark, setFileDashboardDark] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [checked, setChecked] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [dashboardLightImgSrc, setDashboardLightImgSrc] = useState('');
    const [dashboardDarkImgSrc, setDashboardDarkImgSrc] = useState('');
    const [id, setId] = useState('');
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const defaultLightImage = '/images/front-pages/landing-page/hero-dashboard-light.png';
    const defaultDarkImage = '/images/front-pages/landing-page/hero-dashboard-dark.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const dashboardLightImgLimitText = `${otherData.fileLimitText} (${otherData.dashboardImgLightDim})`;
    const dashboardDarkImgLimitText = `${otherData.fileLimitText} (${otherData.dashboardImgDarkDim})`;
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const { websiteSettingsPermission } = SubUserPermission();
    const handleFileInputChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    if (type === 'dashboardLightImage') {
                        setDashboardLightImgSrc(base64Data);
                        setFileDashboardLight(base64Data);
                    } else if (type === 'dashboardDarkImage') {
                        setDashboardDarkImgSrc(base64Data);
                        setFileDashboardDark(base64Data);
                    }
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else {
                if (type === 'dashboardLightImage') {
                    setDashboardLightImgSrc(invalidImg);
                    setApiErrors(prev => ({ ...prev, dashboardImageLight: responseData.invalidFileType }));
                } else if (type === 'dashboardDarkImage') {
                    setDashboardDarkImgSrc(invalidImg);
                    setApiErrors(prev => ({ ...prev, dashboardImageDark: responseData.invalidFileType }));
                }
            }
        }
    };
    const handleWebiteSettingEdit = async (data) => {
        if (apiErrors.dashboardImageLight || apiErrors.dashboardImageDark) {
            return;
        }
        setApiErrors({});
        setIsButtonLoading(true);
        const isfrontendvisible = checked ? "Y" : "N";
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value === null ? "" : value);
        });
        if (fileDashboardLight) {
            const filenameDashboard = 'dashboard-image-light.png';
            const fileLightImg = base64ToFile(fileDashboardLight, filenameDashboard);
            formData.append('dashboardImageLight', fileLightImg);
        }
        if (fileDashboardDark) {
            const filenameNavbar = 'dashboard-image-dark.png';
            const fileDarkImg = base64ToFile(fileDashboardDark, filenameNavbar);
            formData.append('dashboardImageDark', fileDarkImg);
        };
        if (id) formData.append('id', id);
        formData.append('sectionType', 'banner_section');
        formData.append('isfrontendvisible', isfrontendvisible);
        const response = await apiClient.post('/api/website-settings/first-section', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            setApiErrors({});
            getSystemSetting();
            setIsButtonLoading(false);
        } else {
            setApiErrors(response.data.message);
            setIsButtonLoading(false);
        }
    };
    const getSystemSetting = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/website-settings/first-section`);
        if (response.data.result === true) {
            const { id, image1, image2, title, description, badgeTitle, isfrontendvisible } = response.data.message;
            setValue('bannerText', title);
            setValue('bannerSubText', description);
            setValue('buttonText', badgeTitle);
            setDashboardLightImgSrc(image1);
            setDashboardDarkImgSrc(image2);
            setId(id);
            setChecked(isfrontendvisible === "Y" ? true : false);
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
                            <img height={100} width={100} className='rounded' src={dashboardLightImgSrc || defaultLightImage} alt='Logo' />
                            {((websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y")) && (
                                <div className='flex flex-grow flex-col gap-4'>
                                    <div className='flex flex-col sm:flex-row gap-4'>
                                        <FormControl>
                                            <Button component='label' variant='contained' htmlFor='dashboard-light-logo'>
                                                Upload Dashboard Light Image
                                                <input
                                                    hidden
                                                    type='file'
                                                    accept='image/png, image/jpeg'
                                                    onChange={(e) => { handleFileInputChange(e, 'dashboardLightImage') }}
                                                    id='dashboard-light-logo'
                                                />
                                            </Button>
                                            {apiErrors?.dashboardImageLight && (
                                                <FormHelperText className='text-red-500'>
                                                    {apiErrors?.dashboardImageLight}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </div>
                                    <Typography>{dashboardLightImgLimitText}</Typography>
                                </div>
                            )}
                            <img height={100} width={100} className='rounded' src={dashboardDarkImgSrc || defaultDarkImage} alt='Logo' />
                            {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
                                <div className='flex flex-grow flex-col gap-4'>
                                    <div className='flex flex-col sm:flex-row gap-4'>
                                        <FormControl>
                                            <Button component='label' variant='contained' htmlFor='dashboard-dark-logo'>
                                                Upload Dashboard Dark Image
                                                <input
                                                    hidden
                                                    type='file'
                                                    accept='image/png, image/jpeg'
                                                    onChange={(e) => { handleFileInputChange(e, 'dashboardDarkImage') }}
                                                    id='dashboard-dark-logo'
                                                />
                                            </Button>
                                            {apiErrors?.dashboardImageDark && (
                                                <FormHelperText className='text-red-500'>
                                                    {apiErrors?.dashboardImageDark}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </div>
                                    <Typography>{dashboardDarkImgLimitText}</Typography>
                                </div>
                            )}
                        </div>
                        <Divider className='mbs-4' />
                    </CardContent>
                    <CardContent>
                        <form autoComplete='off' onSubmit={handleSubmit(handleWebiteSettingEdit)}>
                            <Grid container spacing={6}>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='title' text='Title' />}
                                        placeholder='Title'
                                        inputProps={{ maxLength: 100 }}
                                        error={!!errors.bannerText || apiErrors?.bannerText}
                                        helperText={errors?.bannerText?.message || apiErrors?.bannerText}
                                        {...register('bannerText', { required: registerData.titleReq, validate: value => value.trim() !== '' || registerData.titleReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        label={<CustomInputLabel htmlFor='button-name' text='Button Name' />}
                                        placeholder='Get Early access'
                                        inputProps={{ maxLength: 100 }}
                                        error={!!errors.buttonText || apiErrors?.buttonText}
                                        helperText={errors?.buttonText?.message || apiErrors?.buttonText}
                                        {...register('buttonText', { required: registerData.buttonNameReq, validate: value => value.trim() !== '' || registerData.buttonNameReq })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextFieldStyled
                                        fullWidth
                                        variant='filled'
                                        size={"small"}
                                        InputLabelProps={{ shrink: true }}
                                        multiline="true"
                                        rows={3}
                                        label={<CustomInputLabel htmlFor='description' text='Description' />}
                                        placeholder='Description'
                                        inputProps={{ maxLength: 500 }}
                                        error={!!errors.bannerSubText || apiErrors?.bannerSubText}
                                        helperText={errors?.bannerSubText?.message || apiErrors?.bannerSubText}
                                        {...register('bannerSubText', { required: registerData.descriptionReq, validate: value => value.trim() !== '' || registerData.descriptionReq })}
                                    />
                                </Grid>
                                <Grid item xs={12} className='flex items-start'>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={<Switch checked={checked} onChange={() => setChecked(!checked)} />}
                                            label={registerData.landingPageVisibleLabel}
                                            labelPlacement="start"
                                            className='pl-2'
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                    {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
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

export default WebsiteDetails
