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
import { useForm } from 'react-hook-form';
import { base64ToFile, showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, Divider, FormControl, FormHelperText } from '@mui/material';

const EditTestimonialInfo = ({ open, setOpen, data, id, handleTestimonialUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [fileCompanyImg, setFileCompanyImg] = useState('');
    const [companyImgSrc, setCompanyImgSrc] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const imgLimitText = `${otherData.fileLimitText} (${otherData.reviewImgDarkDim})`;
    const defaultImage = '/images/default-images/testimonial-company.png';
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

    useEffect(() => {
        if (open && data) {
            reset({
                postedBy: data?.postedBy || '',
                rating: data?.rating || '',
                designation: data?.designation || '',
                description: data?.description || '',
            });
            setCompanyImgSrc(data?.image);
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
        setIsLoading(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value === null ? "" : value);
        });
        if (fileCompanyImg) {
            const filenameCompany = 'company-image.png';
            const fileLightImg = base64ToFile(fileCompanyImg, filenameCompany);
            formData.append('image', fileLightImg);
        }
        if (id) formData.append('id', id);
        const { data: { result, message } } = await apiClient.post('/api/website-settings/testimonial/review', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (result === true) {
            handleTestimonialUpdate(message);
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
                Edit Testimonial Information
            </DialogTitle>
            <CardContent className='overflow-visible pbs-0 sm:pli-16'>
                <div className='flex max-sm:flex-col items-center gap-6'>
                    <img className='rounded w-[100px] h-[30px]' src={companyImgSrc || defaultImage} alt='Logo' />
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
                        {/* <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='posted-user' text='Posted User' />}
                                placeholder='john'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                disabled
                                {...register('postedBy', { required: registerData.nameReq })}
                                error={!!errors?.postedBy || !!apiErrors?.postedBy}
                                helperText={errors?.postedBy ? errors?.postedBy?.message : '' || apiErrors?.postedBy}
                            />
                        </Grid> */}
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Designation'
                                placeholder='Designation'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('designation')}
                                error={!!errors?.designation || !!apiErrors?.designation}
                                helperText={errors?.designation?.message || apiErrors?.designation}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Rating'
                                placeholder='Rating'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('rating')}
                                error={!!errors?.rating || !!apiErrors?.rating}
                                helperText={errors?.rating?.message || apiErrors?.rating}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                label='Description'
                                placeholder='Description'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                size={"small"}
                                multiline={true}
                                rows={3}
                                {...register('description')}
                                error={Boolean(errors?.description) || !!apiErrors?.description}
                                helperText={errors?.description ? errors?.description?.message : '' || apiErrors?.description || apiErrors?.description}
                            />
                        </Grid>
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

EditTestimonialInfo.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleTestimonialUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default EditTestimonialInfo
