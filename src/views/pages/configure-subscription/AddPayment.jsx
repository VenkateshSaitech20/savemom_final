import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm, Controller } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { registerData, responseData, types } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { showToast } from '@/utils/helper';

const AddPayment = props => {
    const { open, handleClose, onUserAdded } = props;

    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { control, reset, handleSubmit, formState: { errors }, register } = useForm({})

    const onSubmit = async data => {
        setApiErrors({});
        setIsLoading(true);
        const response = await apiClient.post('/api/configure-subscription', data)
        if (response?.data?.result === true) {
            await onUserAdded();
            handleClose();
            reset();
            showToast(true, response?.data?.message);
            setApiErrors({});
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(response.data.message)
            }
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        handleClose()
        setIsLoading(false);
        setApiErrors({});
        reset();
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
                <Typography variant='h5'>Add Payment Method</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <Typography variant='h6' className='pl-6 text-warning mt-3'>{registerData.packageConfigValMsg}</Typography>
            <div className='p-6 pt-4'>
                <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6' autoComplete='off'>
                    <TextFieldStyled
                        autoFocus
                        fullWidth
                        label={<CustomInputLabel htmlFor='name' text='Name' />}
                        variant='filled'
                        InputLabelProps={{ shrink: true }}
                        placeholder='Enter your name'
                        {...register('name', {
                            required: registerData.nameReq,
                            validate: value => value.trim() !== '' || registerData.nameReq
                        })}
                        error={!!errors?.name || !!apiErrors?.name}
                        helperText={errors?.name?.message || apiErrors?.name}
                    />
                    <TextFieldStyled
                        autoFocus
                        fullWidth
                        label={<CustomInputLabel htmlFor='publicKey' text='Public Key' />}
                        variant='filled'
                        InputLabelProps={{ shrink: true }}
                        placeholder='Enter your Public Key'
                        {...register('publicKey', { required: registerData.publicKeyReq })}
                        error={!!errors?.publicKey || !!apiErrors?.publicKey}
                        helperText={errors?.publicKey?.message || apiErrors?.publicKey}
                    />
                    <TextFieldStyled
                        autoFocus
                        fullWidth
                        label={<CustomInputLabel htmlFor='privateKey' text='Private Key (Secret Key)' />}
                        variant='filled'
                        InputLabelProps={{ shrink: true }}
                        placeholder='Enter your Private Key'
                        {...register('privateKey', { required: registerData?.privateKeyReq })}
                        error={!!errors?.privateKey || !!apiErrors?.privateKey}
                        helperText={errors?.privateKey?.message || apiErrors?.privateKey}
                    />
                    <Controller
                        name='type'
                        control={control}
                        rules={{ required: registerData.typeReq }}
                        defaultValue=''
                        render={({ field }) => (
                            <TextFieldStyled
                                select
                                fullWidth
                                id='select-type'
                                label={<CustomInputLabel htmlFor='select-type' text='Select Type' />}
                                variant='filled'
                                InputLabelProps={{ shrink: true }}
                                {...field}
                                error={Boolean(errors?.type) || !!apiErrors?.type}
                                helperText={errors?.type?.message || apiErrors?.type}
                            >
                                {types?.map(item => (
                                    <MenuItem value={item.type} key={item.type}>
                                        {item.type}
                                    </MenuItem>
                                ))}
                            </TextFieldStyled>
                        )}
                    />
                    <div className='flex items-center gap-4'>
                        <Button variant='contained' type='submit'>
                            {isLoading ? <Loader type="btnLoader" /> : 'Submit'}
                        </Button>
                        <Button variant='tonal' color='error' type='reset' onClick={() => handleReset()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </Drawer>
    )
}

AddPayment.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    onUserAdded: PropTypes.func,
};
export default AddPayment
