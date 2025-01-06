import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, Grid } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { showToast } from '@/utils/helper';

const AddCategory = props => {
    const { open, handleClose, handleCategoryAdded } = props;
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm();
    const { categoryPermission } = SubUserPermission();

    const handleReset = () => {
        handleClose()
        setApiErrors({});
        reset();
    };

    const handleCategorySubmit = async (data) => {
        setApiErrors({});
        setIsButtonLoading(true);
        const response = await apiClient.post('/api/content-management/category', data);
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handleCategoryAdded();
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
                <Typography variant='h5'>Add Category</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleCategorySubmit)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='name' text='Category Name' />}
                                    placeholder='Category Name'
                                    error={!!errors.categoryName || apiErrors?.categoryName}
                                    helperText={errors?.categoryName?.message || apiErrors?.categoryName}
                                    {...register('categoryName', { required: registerData.categoryNameReq, validate: value => value.trim() !== '' || registerData.categoryNameReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name='isActive'
                                    control={control}
                                    defaultValue='Y'
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            id='isActive'
                                            label='Active Status'
                                            size="small"
                                            variant='filled'
                                            InputLabelProps={{ shrink: true }}
                                            {...field}
                                            error={!!apiErrors?.isActive}
                                            helperText={apiErrors?.isActive}
                                        >
                                            <MenuItem value='' disabled>
                                                Select Active Status
                                            </MenuItem>
                                            <MenuItem value='Y'>Yes</MenuItem>
                                            <MenuItem value='N'>No</MenuItem>
                                        </TextFieldStyled>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(categoryPermission?.editPermission === "Y" || categoryPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Add Category"}
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

AddCategory.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handleCategoryAdded: PropTypes.func,
};

export default AddCategory
