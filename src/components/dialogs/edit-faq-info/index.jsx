'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { otherData, responseData } from '@/utils/message';
import { useForm } from 'react-hook-form';
import { base64ToFile, showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';

const EditFaqInfo = ({ open, setOpen, data, id, handleFaqUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const imgLimitText = `${otherData.fileLimitText} (${otherData.reviewImgDarkDim})`;
    const defaultImage = '/images/default-images/testimonial-company.png';
    const invalidImg = '/images/misc/invalid-files.jpg';
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');

    useEffect(() => {
        if (open && data) {
            reset({
                question: data?.question || '',
                answer: data?.answer || '',

            });

        }
    }, [data, open, reset]);
    const handleClose = () => {
        setOpen(false)

    };
    const handleUpdateFaqData = async (data) => {
        setIsLoading(true);
        if (id) {
            data = { ...data, id }
        }
        const { data: { result, message } } = await apiClient.post('/api/website-settings/faq/question', data
        );
        if (result === true) {
            handleFaqUpdate(data);
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
                Edit Faq Information
            </DialogTitle>

            <form onSubmit={handleSubmit(handleUpdateFaqData)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>

                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='question' text='Question' />}
                                placeholder='Question'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('question')}
                                error={!!errors?.question || !!apiErrors?.question}
                                helperText={errors?.question?.message || apiErrors?.question}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='answer' text='Answer' />}
                                placeholder='Answer'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('answer')}
                                error={!!errors?.answer || !!apiErrors?.answer}
                                helperText={errors?.answer?.message || apiErrors?.answer}
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

EditFaqInfo.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleFaqUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default EditFaqInfo
