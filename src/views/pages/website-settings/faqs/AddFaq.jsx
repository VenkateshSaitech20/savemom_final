import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, Grid } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { showToast } from '@/utils/helper';

const AddFaq = props => {
    const { open, handleClose, handleFaqAdded } = props;
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { websiteSettingsPermission } = SubUserPermission();

    const handleReset = () => {
        handleClose()
        setApiErrors({});
        reset();
    };

    const handleReviewAdd = async (data) => {
        if (apiErrors?.image) {
            return;
        }
        setApiErrors({});
        setIsButtonLoading(true);

        const response = await apiClient.post('/api/website-settings/faq/question', data);
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handleFaqAdded();
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
                <Typography variant='h5'>Add FAQ</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleReviewAdd)}>
                        <Grid container spacing={6}>

                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='question' text='Question' />}
                                    placeholder='Question'
                                    error={!!errors.question || apiErrors?.question}
                                    helperText={errors?.question?.message || apiErrors?.question}
                                    {...register('question', { required: registerData.quesReq, validate: value => value.trim() !== '' || registerData.quesReq })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    multiline="true"
                                    rows="8"
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='answer' text='Answer' />}
                                    placeholder='Answer'
                                    error={!!errors.answer || apiErrors?.answer}
                                    helperText={errors?.answer?.message || apiErrors?.answer}
                                    {...register('answer', { required: registerData.ansReq, validate: value => value.trim() !== '' || registerData.ansReq })}
                                />
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(websiteSettingsPermission?.editPermission === "Y" || websiteSettingsPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Submit"}
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

AddFaq.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handleFaqAdded: PropTypes.func,
};
export default AddFaq
