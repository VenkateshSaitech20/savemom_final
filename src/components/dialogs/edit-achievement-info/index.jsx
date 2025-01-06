'use client';
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
import { otherData, responseData } from '@/utils/message';
import { useForm } from 'react-hook-form';
import { base64ToFile, showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { CardContent, Divider, FormControl, FormHelperText } from '@mui/material';

const EditKeyAchievementInfo = ({ open, setOpen, data, id, handleAchievementUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [fileCompanyImg, setFileCompanyImg] = useState('');
    const [companyImgSrc, setCompanyImgSrc] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const imgLimitText = `${otherData.fileLimitText} (${otherData.keyAchivementImgDim})`;
    const defaultImage = '/images/default-images/testimonial-company.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    setCompanyImgSrc(base64Data);
                    setFileCompanyImg(base64Data);
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else {
                setCompanyImgSrc(invalidImg);
                setApiErrors(prev => ({ ...prev, image: responseData.invalidFileType }));
            }
        }
    };

    useEffect(() => {
        if (open && data) {
            reset({
                keyMetric: data?.keyMetric || '',
                highlight: data?.highlight || '',
            });
            setCompanyImgSrc(data?.image || defaultImage);
        }
    }, [data, open, reset]);

    const handleClose = () => {
        setOpen(false);
        reset(); // Reset form fields when closing
    };

    const handleUpdateAchievementData = async (formData) => {
        if (apiErrors?.image) {
            return;
        }
        setIsLoading(true);
        const dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            dataToSend.append(key, value === null ? "" : value);
        });
        if (fileCompanyImg) {
            const filenameCompany = 'company-image.png';
            const fileLightImg = base64ToFile(fileCompanyImg, filenameCompany);
            dataToSend.append('image', fileLightImg);
        }
        if (id) dataToSend.append('id', id);
        try {
            const { data: response } = await apiClient.post('/api/website-settings/key-achievement/achievement', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.result) {
                handleAchievementUpdate(response.message);
                setOpen(false);
                setApiErrors({});
                showToast(true, responseData.dataUpdated);
            } else {
                if (response.message?.roleError?.name === responseData.tokenExpired || response.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                } else {
                    setApiErrors(response.message);
                }
            }
        } catch (error) {
            console.error('Error updating achievement data:', error);
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
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className='bx-x' />
            </DialogCloseButton>
            <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                Edit Key Achievement Information
            </DialogTitle>
            <CardContent className='overflow-visible pbs-0 sm:pli-16'>
                <div className='flex max-sm:flex-col items-center gap-6'>
                    <img className='rounded w-[65px] h-[65px]' src={companyImgSrc || defaultImage} alt='Logo' />
                    <div className='flex flex-grow flex-col gap-4'>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <FormControl>
                                <Button component='label' variant='contained' htmlFor='company-logo'>
                                    Upload Image
                                    <input
                                        hidden
                                        type='file'
                                        accept='image/png, image/jpeg'
                                        onChange={handleFileInputChange}
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
                </div>
                <Divider className='mbs-4' />
            </CardContent>

            <form onSubmit={handleSubmit(handleUpdateAchievementData)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Key Metric'
                                placeholder='Key Metric'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('keyMetric', { required: 'Key Metric is required' })}
                                error={!!errors?.keyMetric || !!apiErrors?.keyMetric}
                                helperText={errors?.keyMetric?.message || apiErrors?.keyMetric}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label='Highlight'
                                placeholder='Highlight'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('highlight', { required: 'Highlight is required' })}
                                error={!!errors?.highlight || !!apiErrors?.highlight}
                                helperText={errors?.highlight?.message || apiErrors?.highlight}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    <Button variant='contained' type='submit'>
                        {isLoading ? <Loader type="btnLoader" /> : 'Submit'}
                    </Button>
                    <Button variant='tonal' color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

EditKeyAchievementInfo.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    data: PropTypes.object,
    id: PropTypes.string,
    handleAchievementUpdate: PropTypes.func.isRequired,
};

export default EditKeyAchievementInfo;
