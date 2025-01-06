import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm } from 'react-hook-form';
import { otherData, responseData } from '@/utils/message';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import { CardContent, FormControl, FormHelperText, Grid } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { showToast } from '@/utils/helper';
import Loader from '@/components/loader';

const AddBrand = (props) => {
    const { open, handleClose, handleBrandAdded, companyImgSrc } = props;
    const [apiErrors, setApiErrors] = useState({});
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { handleSubmit, reset } = useForm();
    const imgLimitText = `${otherData.fileLimitText} (${otherData.reviewImgDarkDim})`;
    const { websiteSettingsPermission } = SubUserPermission();
    const defaultImage = '/images/default-images/air-bnb.png';
    const handleReset = () => {
        handleClose();
        setApiErrors({});
        reset();
        setImage('');
        setImagePreview('');
    };
    const handleReviewAdd = async (data, e) => {
        e.preventDefault();
        if (!image) {
            setApiErrors({ image: "Please upload an image." });
            return;
        }
        setApiErrors({});
        setIsButtonLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        try {
            const response = await apiClient.post('/api/website-settings/brand/brandimage', formData);
            if (response.data.result === true) {
                showToast(true, response.data.message);
                handleBrandAdded();
                handleReset();
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                } else {
                    setApiErrors(response.data.message);
                }
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            showToast(false, "An error occurred while uploading the image.");
        } finally {
            setIsButtonLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImage('');
            setImagePreview('');
        }
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
                <Typography variant='h5'>
                    Add Brand
                </Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleReviewAdd)}>
                        <Grid container spacing={6}>
                            <CardContent>
                                <div className='flex max-sm:flex-col items-center gap-6'>
                                    <img
                                        src={imagePreview || companyImgSrc || defaultImage}
                                        alt="Preview"
                                        height={30}
                                        width={100}
                                        className='rounded'

                                    />
                                    {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
                                        <div className='flex flex-grow flex-col gap-4'>
                                            <div className='flex flex-col sm:flex-row gap-4'>
                                                <FormControl>
                                                    <Button component='label' variant='contained' htmlFor='company-logo'>
                                                        Upload brand
                                                        <input
                                                            hidden
                                                            type='file'
                                                            accept='image/png, image/jpeg'
                                                            onChange={handleImageChange}
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
                                            <Typography>{imgLimitText}</Typography> {/* Adjust margin for text */}
                                        </div>
                                    )}
                                </div>
                                <Divider className='mbs-4' />
                            </CardContent>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'> {/* Adjust margin for button */}
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Submit"}
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </div>
        </Drawer>
    );

};
AddBrand.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleBrandAdded: PropTypes.func.isRequired,
    companyImgSrc: PropTypes.string,
};
export default AddBrand;



