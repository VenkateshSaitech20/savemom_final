'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextFieldStyled from '@core/components/mui/TextField';
import { useForm } from 'react-hook-form';
import { registerData } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import CustomInputLabel from '@/components/asterick';
import SubUserPermission from '@/utils/SubUserPermission';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';

const PlansSection = () => {
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [id, setId] = useState('');
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const { websiteSettingsPermission } = SubUserPermission();
    const [checked, setChecked] = useState(true);

    const handlePlansEdit = async (data) => {
        setApiErrors({});
        setIsButtonLoading(true);
        const isfrontendvisible = checked ? "Y" : "N";
        const postData = { ...data, sectionType: 'plans', isfrontendvisible };
        if (id) { postData.id = id }
        const response = await apiClient.post('/api/website-settings/section-content', postData);
        if (response?.data?.result === true) {
            showToast(true, response.data.message);
            getPlans('plans');
            setApiErrors({});
            setIsButtonLoading(false);
        } else {
            setApiErrors(response.data.message);
            setIsButtonLoading(false);
        }
    };

    const getPlans = async (sectionType) => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/website-settings/section-content?sectionType=${sectionType}`);
        if (response.data.result === true) {
            const { id, badgeTitle, title, description, discount } = response.data.message;
            setValue("badgeTitle", badgeTitle);
            setValue("title", title);
            setValue("description", description);
            setValue("discount", discount)
            setChecked(response.data.message.isfrontendvisible === "Y" ? true : false);
            setId(id);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getPlans('plans');
    }, []);

    return (
        <Card>
            {isLoading && <div className='my-4'><Loader /></div>}
            {!isLoading && (
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handlePlansEdit)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='badge-title' text='Badge Title' />}
                                    placeholder='Badge Title'
                                    error={!!errors.badgeTitle || apiErrors?.badgeTitle}
                                    helperText={errors?.badgeTitle?.message || apiErrors?.badgeTitle}
                                    {...register('badgeTitle', { required: registerData?.badgeTitleReq, validate: value => value.trim() !== '' || registerData?.badgeTitleReq })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='title' text='Title' />}
                                    placeholder='Title'
                                    error={!!errors?.title || apiErrors?.title}
                                    helperText={errors?.title?.message || apiErrors?.title}
                                    {...register('title', { required: registerData?.titleReq, validate: value => value.trim() !== '' || registerData?.titleReq })}
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
                                    error={!!errors.description || apiErrors?.description}
                                    helperText={errors?.description?.message || apiErrors?.description}
                                    {...register('description', { required: registerData?.descriptionReq, validate: value => value.trim() !== '' || registerData?.descriptionReq })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='discount' text='Discount' />}
                                    placeholder='Discount'
                                    error={!!errors?.discount || apiErrors?.discount}
                                    helperText={errors?.discount?.message || apiErrors?.discount}
                                    {...register('discount', { required: registerData?.discountReq, validate: value => value.trim() !== '' || registerData?.discountReq })}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} className='flex gap-4 my-5 flex-wrap ms-2'>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Switch checked={checked} onChange={() => setChecked(!checked)} />}
                                    label={registerData.landingPageVisibleLabel}
                                    labelPlacement="start"
                                    className='pbe-0'

                                />
                            </FormGroup></Grid>
                        <Grid item xs={12} className='flex gap-4 flex-wrap'>
                            {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
                                <Button variant='contained' type='submit'>
                                    {isButtonLoading ? <Loader type="btnLoader" /> : "Save Changes"}
                                </Button>
                            )}
                        </Grid>
                    </form>
                </CardContent>
            )
            }
        </Card>
    )
}

export default PlansSection
