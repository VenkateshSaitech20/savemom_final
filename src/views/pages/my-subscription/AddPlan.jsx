import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { otherData, registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, FormControl, FormHelperText, Grid, MenuItem } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { base64ToFile, showToast } from '@/utils/helper';

const AddPlan = props => {
    const { open, handleClose, handlePackageAdded } = props;
    const [filePackageImg, setFilePackageImg] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [packageImgSrc, setPackageImgSrc] = useState('');
    const [adminRoles, setAdminRoles] = useState([]);
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm({
        defaultValues: {
            features: [{ feature: '' }],
        },
    });
    const defaultImage = '/images/default-images/pricing-basic.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const imgLimitText = `${otherData.fileLimitText} (${otherData.packagePlanImgDim})`;
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const { mySubscriptionPermission } = SubUserPermission();
    const handleReset = () => {
        handleClose()
        setApiErrors({});
        reset();
    };

    const handleFileInputChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    if (type === 'image') {
                        setPackageImgSrc(base64Data);
                        setFilePackageImg(base64Data);
                        setApiErrors(prev => ({ ...prev, image: '' }));
                    }
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else if (type === 'image') {
                setPackageImgSrc(invalidImg);
                setApiErrors(prev => ({ ...prev, image: responseData.invalidFileType }));
            }
        }
    };

    const handlePackageAdd = async (data) => {
        if (apiErrors?.image) {
            return;
        }
        setApiErrors({});
        setIsButtonLoading(true);
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

        if (filePackageImg) {
            const fileNamePackage = 'package-image.png';
            const fileLightImg = base64ToFile(filePackageImg, fileNamePackage);
            formData.append('image', fileLightImg);
        }
        const roleName = adminRoles?.find((role) => role.id === data.roleId);
        formData.append('roleName', roleName?.roleName);
        const response = await apiClient.post('/api/package-plans', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handlePackageAdded();
            setApiErrors({});
            getRoles();
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'features',
    });
    const getRoles = async () => {
        const response = await apiClient.get('/api/package-plans/get-by-id')
        if (response?.data?.result) {
            setAdminRoles(response?.data?.message)
        }
    };
    useEffect(() => {
        getRoles();
    }, []);

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
                <Typography variant='h5'>Add Plan</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <div className='flex max-sm:flex-col items-center gap-6'>
                        <img height={100} width={100} className='rounded' src={packageImgSrc || defaultImage} alt='Logo' />
                        {((mySubscriptionPermission?.editPermission === "Y" || mySubscriptionPermission?.writePermission === "Y")) && (
                            <div className='flex flex-grow flex-col gap-4'>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <FormControl>
                                        <Button component='label' variant='contained' htmlFor='plan-image'>
                                            Upload Image
                                            <input
                                                hidden
                                                type='file'
                                                accept='image/png, image/jpeg'
                                                onChange={(e) => { handleFileInputChange(e, 'image') }}
                                                id='plan-image'
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
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handlePackageAdd)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='title' text='Title' />}
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
                                    label={<CustomInputLabel htmlFor='subTitle' text='Sub Title' />}
                                    placeholder='Sub Title'
                                    error={!!errors.subTitle || apiErrors?.subTitle}
                                    helperText={errors?.subTitle?.message || apiErrors?.subTitle}
                                    {...register('subTitle', { required: registerData.subTitleReq, validate: value => value.trim() !== '' || registerData.subTitleReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='monthlyPrice' text='Monthly Price' />}
                                    placeholder='15'
                                    error={!!errors.monthlyPrice || apiErrors?.monthlyPrice}
                                    helperText={errors?.monthlyPrice?.message || apiErrors?.monthlyPrice}
                                    {...register('monthlyPrice', { required: registerData.monthlyPriceReq, validate: value => value.trim() !== '' || registerData.monthlyPriceReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name='roleId'
                                    control={control}
                                    rules={{ required: registerData.roleNameReq }}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            variant='filled'
                                            size={"small"}
                                            InputLabelProps={{ shrink: true }}
                                            id='select-role'
                                            label={<CustomInputLabel htmlFor='select-role' text='Select Role' />}
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
                            {fields.map((item, index) => (
                                <Grid item xs={12} key={item.id} container alignItems="center" spacing={2}>
                                    <Grid item xs>
                                        <TextFieldStyled
                                            {...register(`features.${index}.feature`, { required: 'Feature is required' })}
                                            fullWidth
                                            variant='filled'
                                            // label={<CustomInputLabel htmlFor='addFeatures' text='Add Features' />}
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
                                    {((fields.length - 1) === index) && <Grid item >
                                        <IconButton onClick={() => append({ feature: '' })} color='primary'>
                                            <i className='bx bx-plus' />
                                        </IconButton>
                                    </Grid>}
                                </Grid>
                            ))}
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(mySubscriptionPermission?.editPermission === "Y" || mySubscriptionPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Add plan"}
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

AddPlan.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handlePackageAdded: PropTypes.func,
};
export default AddPlan
