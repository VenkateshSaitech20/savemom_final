import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { otherData, registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, FormControl, FormHelperText, Grid } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { base64ToFile, showToast } from '@/utils/helper';

const AddTestimonial = props => {
    const { open, handleClose, handleTestimonialAdded } = props;
    const [fileCompanyImg, setFileCompanyImg] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [companyImgSrc, setCompanyImgSrc] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const defaultImage = '/images/default-images/testimonial-company.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const imgLimitText = `${otherData.fileLimitText} (${otherData.reviewImgDarkDim})`;
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const { websiteSettingsPermission } = SubUserPermission();

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
                        setCompanyImgSrc(base64Data);
                        setFileCompanyImg(base64Data);
                    }
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else {
                if (type === 'image') {
                    setCompanyImgSrc(invalidImg);
                    setApiErrors(prev => ({ ...prev, image: responseData.invalidFileType }));
                }
            }
        }
    };

    const handleReviewAdd = async (data) => {
        if (apiErrors?.image) {
            return;
        }
        setApiErrors({});
        setIsButtonLoading(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value === null ? "" : value);
        });
        if (fileCompanyImg) {
            const filenameCompany = 'company-image.png';
            const fileLightImg = base64ToFile(fileCompanyImg, filenameCompany);
            formData.append('image', fileLightImg);
        }
        const response = await apiClient.post('/api/website-settings/testimonial/review', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handleTestimonialAdded();
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
                <Typography variant='h5'>Add Testimonial</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <div className='flex max-sm:flex-col items-center gap-6'>
                        <img height={100} width={100} className='rounded w-[91px] h-[23px]' src={companyImgSrc || defaultImage} alt='Logo' />
                        {((websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y")) && (
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
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleReviewAdd)}>
                        <Grid container spacing={6}>
                            {/* <Grid item xs={12} >
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='name' text='User' />}
                                    placeholder='Name'
                                    error={!!errors.postedBy || apiErrors?.postedBy}
                                    helperText={errors?.postedBy?.message || apiErrors?.postedBy}
                                    {...register('postedBy', { required: registerData.nameReq, validate: value => value.trim() !== '' || registerData.nameReq })}
                                />
                            </Grid> */}
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='designation' text='Designation' />}
                                    placeholder='Designation'
                                    error={!!errors.designation || apiErrors?.designation}
                                    helperText={errors?.designation?.message || apiErrors?.designation}
                                    {...register('designation', { required: registerData.designationReq, validate: value => value.trim() !== '' || registerData.designationReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='rating' text='Rating' />}
                                    placeholder='Rating'
                                    error={!!errors.rating || apiErrors?.rating}
                                    helperText={errors?.rating?.message || apiErrors?.rating}
                                    {...register('rating', { required: registerData.ratingReq, validate: value => value.trim() !== '' || registerData.ratingReq })}
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
                                    {...register('description', { required: registerData.descriptionReq, validate: value => value.trim() !== '' || registerData.descriptionReq })}
                                />
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Add review"}
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

AddTestimonial.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handleTestimonialAdded: PropTypes.func,
};
export default AddTestimonial
