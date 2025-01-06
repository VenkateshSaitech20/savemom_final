'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { otherData, registerData, responseData } from '@/utils/message';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { base64ToFile, showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { CardContent, Divider, FormControl, FormHelperText, IconButton, MenuItem } from '@mui/material';
import CustomInputLabel from '@/components/asterick';

const EditPackagePlan = ({ open, setOpen, data, id, handlePackageUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [fileCompanyImg, setFileCompanyImg] = useState('');
    const [companyImgSrc, setCompanyImgSrc] = useState('');
    const [adminRoles, setAdminRoles] = useState([]);

    const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
        defaultValues: {
            features: data?.planBenefits?.length ? data.planBenefits : [{ feature: '' }],
        },
    });
    const imgLimitText = `${otherData.fileLimitText} (${otherData.packagePlanImgDim})`;
    const defaultImage = "/images/default-images/pricing-basic.png"
    const invalidImg = '/images/misc/invalid-files.jpg';
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');

    const handleFileInputChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    if (type === 'image') {
                        setCompanyImgSrc(base64Data);
                        setFileCompanyImg(base64Data);
                        setApiErrors(prev => ({ ...prev, image: "" }));
                    }
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else if (type === 'image') {
                setCompanyImgSrc(invalidImg);
                setApiErrors(prev => ({ ...prev, image: responseData.invalidFileType }));
            }
        }
    };

    useEffect(() => {
        if (open && data) {
            reset({
                title: data.title || '',
                subTitle: data.subTitle || '',
                features: data.planBenefits.length ? data.planBenefits : [{ feature: '' }],
                monthlyPrice: data.monthlyPrice,
                roleId: data.roleId || ""
            });
            setCompanyImgSrc(data.image || defaultImage);
            getRoles();
        }
    }, [data, open, reset]);


    const handleClose = () => {
        setOpen(false)
        // reset()
    };

    const handleUpdateTestimonialData = async (data) => {
        if (apiErrors?.image) {
            return;
        }
        setApiErrors({});
        setIsLoading(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'features') {
                const featuresArray = value.map(item => ({ feature: item.feature }));
                formData.append('planBenefits', JSON.stringify(featuresArray));
            } else if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${key}[]`, JSON.stringify(item));
                });
            } else {
                formData.append(key, value === null ? "" : value);
            }
        });
        if (fileCompanyImg) {
            const filenameCompany = 'company-image.png';
            const fileLightImg = base64ToFile(fileCompanyImg, filenameCompany);
            formData.append('image', fileLightImg);
        }
        const roleName = adminRoles?.find((role) => role.id === data.roleId);
        formData.append('roleName', roleName?.roleName);
        if (id) formData.append('id', id);
        const { data: { result, message } } = await apiClient.post('/api/package-plans', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (result === true) {
            handlePackageUpdate(message);
            setOpen(false);
            setApiErrors({});
            showToast(true, responseData.dataUpdated);
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'features',
    });

    const getRoles = async () => {
        const response = await apiClient.get('/api/package-plans/get-by-id')
        if (response?.data?.result) {
            setAdminRoles(response?.data?.message)
        }
    }

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
                Edit Package Plans
            </DialogTitle>

            <CardContent className='overflow-visible pbs-0 sm:pli-16'>
                <div className='flex max-sm:flex-col items-center gap-6'>
                    <img className='rounded w-[100px] h-[100px]' src={companyImgSrc || defaultImage} alt='Logo' />
                    {(
                        <div className='flex flex-grow flex-col gap-4'>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <FormControl>
                                    <Button component='label' variant='contained' htmlFor='company-logo'>
                                        Upload Logo
                                        <input
                                            hidden
                                            type='file'
                                            accept='image/png, image/jpeg'
                                            onChange={(e) => { handleFileInputChange(e, 'image') }}
                                            id='company-logo'
                                        />
                                    </Button>
                                    {apiErrors?.image && (
                                        <FormHelperText className='text-red-500'>
                                            {apiErrors?.image}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </div>
                            <Typography>{imgLimitText}</Typography>
                        </div>
                    )}
                </div>
                <Divider className='mbs-4' />
            </CardContent>

            <form onSubmit={handleSubmit(handleUpdateTestimonialData)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='title' text='Title' />}
                                placeholder='Title'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('title', { required: registerData.titleReq })}
                                error={!!errors?.title || !!apiErrors?.title}
                                helperText={errors?.title ? errors?.title?.message : '' || apiErrors?.title}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='sub-title' text='Sub Title' />}
                                placeholder='Sub Title'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('subTitle')}
                                error={!!errors?.subTitle || !!apiErrors?.subTitle}
                                helperText={errors?.subTitle?.message || apiErrors?.subTitle}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='monthly-price' text='Monthly Price' />}
                                placeholder='15'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('monthlyPrice')}
                                error={!!errors?.monthlyPrice || !!apiErrors?.monthlyPrice}
                                helperText={errors?.monthlyPrice?.message || apiErrors?.monthlyPrice}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='roleId'
                                control={control}
                                rules={{ required: registerData.profileStatusReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='select-role'
                                        label={<CustomInputLabel htmlFor='select-role' text='Select Role' />}
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={Boolean(errors?.roleId) || !!apiErrors?.roleId}
                                        helperText={errors?.roleId?.message || apiErrors?.roleId}
                                    >
                                        {adminRoles?.map(role => (
                                            <MenuItem disabled={role.isAssigned === "Y"} value={role?.id} key={role.id}>
                                                {role?.roleName}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        {fields?.map((item, index) => (
                            <Grid item xs={12} key={item.id} container alignItems="center" spacing={2}>
                                <Grid item xs>
                                    <TextFieldStyled
                                        {...register(`features.${index}.feature`, { required: 'Feature is required' })}
                                        fullWidth
                                        variant='filled'
                                        label={index === 0 ? <CustomInputLabel htmlFor='addFeatures' text='Add Features' /> : ''}
                                        size='small'
                                        placeholder='Type a feature'
                                        error={!!errors.features?.[index]?.feature}
                                        helperText={errors.features?.[index]?.feature?.message}
                                    />
                                </Grid>
                                {index >= 1 && (<Grid item>
                                    <IconButton onClick={() => remove(index)} color='secondary'>
                                        <i className='bx bx-minus' />
                                    </IconButton>
                                </Grid>)}
                                {((fields?.length - 1) === index) && <Grid item >
                                    <IconButton onClick={() => append({ feature: '' })} color='primary'>
                                        <i className='bx bx-plus' />
                                    </IconButton>
                                </Grid>}
                            </Grid>
                        ))}
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

EditPackagePlan.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handlePackageUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default EditPackagePlan
