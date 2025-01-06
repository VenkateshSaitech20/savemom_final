'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { registerData, responseData } from '@/utils/message';
import { Controller, useForm } from 'react-hook-form';
import { showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';

const CategoryDialog = ({ open, setOpen, data, id, handleCategoryUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const { register, handleSubmit, formState: { errors }, control, reset } = useForm();

    useEffect(() => {
        if (open && id && data) {
            setApiErrors({});
            reset({
                categoryName: data?.categoryName || '',
                isActive: data?.isActive || '',
            });
        }
    }, [data, open, reset, id]);

    const handleClose = () => {
        setOpen(false)
        // reset()
    };

    const handleUpdateCategory = async (data) => {
        setIsLoading(true);
        if (id) data.id = id;
        const { data: { result, message } } = await apiClient.post('/api/content-management/category', data);
        if (result === true) {
            showToast(true, responseData.dataUpdated);
            handleCategoryUpdate(message);
            setOpen(false);
            setApiErrors({});
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
                Edit Category
            </DialogTitle>
            <form onSubmit={handleSubmit(handleUpdateCategory)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                size="small"
                                label={<CustomInputLabel htmlFor='name' text='Category Name' />}
                                placeholder='Category Name'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('categoryName', { required: registerData.categoryNameReq, validate: value => value.trim() !== '' || registerData.categoryNameReq })}
                                error={!!errors?.categoryName || !!apiErrors?.categoryName}
                                helperText={errors?.categoryName?.message || apiErrors?.categoryName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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

CategoryDialog.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleCategoryUpdate: PropTypes.any,
    showToast: PropTypes.any,
};

export default CategoryDialog
