import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm, Controller } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { status, registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, Grid } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { showToast } from '@/utils/helper';

const AddTemplate = props => {
    const { open, handleClose, handleTemplateAdded, voiceCallPermission } = props;
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm();

    const handleReset = () => {
        handleClose()
        setApiErrors({});
        reset();
    };

    const handleTemplateSubmit = async (data) => {
        setIsButtonLoading(true);
        const response = await apiClient.post('/api/voice-call/template', data);
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handleTemplateAdded();
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
                <Typography variant='h5'>Add New Template</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <CardContent>
                <form autoComplete='off' onSubmit={handleSubmit(handleTemplateSubmit)}>
                    <Grid container spacing={6}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                label={<CustomInputLabel htmlFor='category' text='Category' />}
                                placeholder='Category'
                                error={!!errors.category || apiErrors?.category}
                                helperText={errors?.category?.message || apiErrors?.category}
                                {...register('category', { required: registerData.categoryReq, validate: value => value.trim() !== '' || registerData.categoryReq })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                multiline="true"
                                rows={10}
                                label={<CustomInputLabel htmlFor='message' text='Message' />}
                                placeholder='Message'
                                error={!!errors.message || apiErrors?.message}
                                helperText={errors?.message?.message || apiErrors?.message}
                                {...register('message', { required: registerData.messageReq, validate: value => value.trim() !== '' || registerData.messageReq })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name='isActive'
                                control={control}
                                rules={{ required: registerData.statusReq }}
                                defaultValue=''
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        size={"small"}
                                        id='status'
                                        label={<CustomInputLabel htmlFor='status' text='Status' />}
                                        {...field}
                                        error={Boolean(errors?.isActive) || !!apiErrors?.isActive}
                                        helperText={errors?.isActive?.message || apiErrors?.isActive}
                                    >
                                        {status?.map(item => (
                                            <MenuItem value={item?.value} key={item?.id}>
                                                {item?.name}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        {((voiceCallPermission?.editPermission === "Y" || voiceCallPermission?.writePermission === "Y")) && (
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                <Button variant='contained' type='submit'>
                                    {isButtonLoading ? <Loader type="btnLoader" /> : "Add template"}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </form>
            </CardContent>
        </Drawer>
    )
}

AddTemplate.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handleTemplateAdded: PropTypes.func,
    voiceCallPermission: PropTypes.any,
};

export default AddTemplate
