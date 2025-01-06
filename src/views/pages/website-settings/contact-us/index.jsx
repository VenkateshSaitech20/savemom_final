'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm } from 'react-hook-form';
import { registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import { Divider, FormControlLabel, FormGroup, Switch } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import CustomInputLabel from '@/components/asterick';
const ContactUs = () => {
    const [apiErrors, setApiErrors] = useState({});
    const [id, setId] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [checked, setChecked] = useState(true);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const { websiteSettingsPermission } = SubUserPermission();
    const handleOnSubmit = async (data) => {
        setApiErrors({});
        setIsButtonLoading(true);
        if (id) data.id = id;
        const isfrontendvisible = checked ? "Y" : "N";
        const postData = { ...data, isfrontendvisible }
        const response = await apiClient.post('/api/website-settings/contact-us', postData);
        if (response.data.result === true) {
            setIsButtonLoading(true);
            showToast(true, response.data.message);
            setApiErrors({});
            getContactUs();
            setIsButtonLoading(false);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.quesOne === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(response.data.message);
                setIsButtonLoading(false);
            }
        }
    }
    const getContactUs = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/website-settings/contact-us`);
        if (response.data.result === true) {
            if (response.data.message) {
                const data = response.data.message;
                Object.keys(data).forEach((key) => {
                    setValue(key, data[key]);
                });
                setChecked(response.data.message.isfrontendvisible === "Y" ? true : false);
                if (data.id) {
                    setId(data.id);
                }
            }
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getContactUs();
    }, []);
    return (
        <Card>
            {isLoading && <div className='my-4'><Loader /></div>}
            {!isLoading && (
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleOnSubmit)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor="badgeTitle" text="Badge Title" />}
                                    placeholder='Badge Title'
                                    error={!!errors.badgeTitle || apiErrors?.badgeTitle}
                                    helperText={errors?.badgeTitle?.message || apiErrors?.badgeTitle}
                                    {...register('badgeTitle', { required: registerData.badgeTitleReq, validate: value => value.trim() !== '' || registerData.badgeTitleReq })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor="title" text="Title" />}
                                    placeholder='Title'
                                    error={!!errors.title || apiErrors?.title}
                                    helperText={errors?.title?.message || apiErrors?.title}
                                    {...register('title', { required: registerData.titleReq, validate: value => value.trim() !== '' || registerData.titleReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor="description" text="Description" />}
                                    placeholder='Description'
                                    multiline
                                    rows={3}
                                    error={!!errors.description || apiErrors?.description}
                                    helperText={errors?.description?.message || apiErrors?.description}
                                    {...register('description', { required: registerData.descriptionReq, validate: value => value.trim() !== '' || registerData.descriptionReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider className='my-2' />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor="cardTitle" text="Card Title" />}
                                    placeholder='Card Title'
                                    error={!!errors.cardTitle || apiErrors?.cardTitle}
                                    helperText={errors?.cardTitle?.message || apiErrors?.cardTitle}
                                    {...register('cardTitle', { required: registerData.titleReq, validate: value => value.trim() !== '' || registerData.titleReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor="cardDescription" text="Card Description" />}
                                    placeholder='Card Description'
                                    multiline
                                    rows={3}
                                    error={!!errors.cardDescription || apiErrors?.cardDescription}
                                    helperText={errors?.cardDescription?.message || apiErrors?.cardDescription}
                                    {...register('cardDescription', { required: registerData.descriptionReq, validate: value => value.trim() !== '' || registerData.descriptionReq })}
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
            )
            }
        </Card>
    )
}
export default ContactUs
