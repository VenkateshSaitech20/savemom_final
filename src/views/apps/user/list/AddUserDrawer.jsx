import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm, Controller } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { profileStatus, registerData, responseData, validations } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import { toast } from 'react-toastify';
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';

const AddUserDrawer = props => {
  const { open, handleClose, onUserAdded } = props;
  const [userRoles, setUserRoles] = useState([]);
  const [apiErrors, setApiErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countryData, setCountryData] = useState([]);
  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    register
  } = useForm({})
  const getUserRole = async () => {
    const response = await apiClient.post('/api/user-role/get-roles-by-user-id', {})
    if (response.data.result === true) {
      setUserRoles(response.data.message)
    } else if (response.data.result === false) {
      if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
        await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
        sessionStorage.removeItem("token");
      }
    }
  };
  const getCountry = async () => {
    setIsLoading(true);
    const response = await apiClient.get('/api/master-data-settings/country');
    if (response.data.result === true) {
      setCountryData(response.data.message);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getUserRole();
    getCountry();
  }, []);
  const onSubmit = async data => {
    setApiErrors({});
    setIsLoading(true);
    const role = userRoles?.find(role => role.id === data.roleId)
    const roleName = role?.roleName?.toLowerCase()
    const response = await apiClient.post('/api/sub-user', { ...data, roleName })
    if (response.data.result === true) {
      await onUserAdded();
      handleClose();
      reset();
      toast.success("User added successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
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
        <Typography variant='h5'>Add New User</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='bx-x text-textPrimary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
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
            label={<CustomInputLabel htmlFor='email' text='Email' />}
            variant='filled'
            InputLabelProps={{ shrink: true }}
            placeholder='Enter your email'
            {...register('email', {
              required: registerData.emailReq,
              pattern: {
                value: validations.emailPattern,
                message: registerData.emailValMsg
              }
            })}
            error={!!errors?.email || !!apiErrors?.email}
            helperText={errors?.email?.message || apiErrors?.email}
          />
          <TextFieldStyled
            autoFocus
            fullWidth
            label={<CustomInputLabel htmlFor='password' text='Password' />}
            variant='filled'
            InputLabelProps={{ shrink: true }}
            placeholder='Enter your password'
            {...register('password', { required: registerData?.passwordReq })}
            error={!!errors?.password || !!apiErrors?.password}
            helperText={errors?.password?.message || apiErrors?.password}
          />
          <TextFieldStyled
            label={<CustomInputLabel htmlFor='contact' text='Contact' />}
            type='text'
            fullWidth
            variant='filled'
            InputLabelProps={{ shrink: true }}
            placeholder='9857452154'
            {...register('contactNo', { required: registerData?.phoneReq })}
            error={!!errors?.contactNo || !!apiErrors?.contactNo}
            helperText={errors?.contactNo?.message || apiErrors?.contactNo}
          />
          {/* <TextFieldStyled
            autoFocus
            fullWidth
            label='Company'
            variant='filled'
            InputLabelProps={{ shrink: true }}
            placeholder='Enter your Company'
            {...register('company')}
            error={!!apiErrors?.company}
            helperText={apiErrors?.company}
          /> */}
          <Controller
            name='countryId'
            control={control}
            rules={{ required: registerData.countryNameReq }}
            defaultValue=''
            render={({ field }) => (
              <TextFieldStyled
                select
                fullWidth
                variant='filled'
                InputLabelProps={{ shrink: true }}
                id='select-country'
                label={<CustomInputLabel htmlFor='select-country' text='Select Country' />}
                {...field}
                error={Boolean(errors?.countryId) || !!apiErrors?.countryId}
                helperText={errors?.countryId?.message || apiErrors?.countryId}
              >
                {countryData?.map(country => (
                  <MenuItem value={country?.id} key={country?.id}>
                    {country?.name}
                  </MenuItem>
                ))}
              </TextFieldStyled>
            )}
          />
          <Controller
            name='roleId'
            control={control}
            rules={{ required: registerData.roleNameReq }}
            defaultValue=''
            render={({ field }) => (
              <TextFieldStyled
                select
                fullWidth
                variant='filled'
                InputLabelProps={{ shrink: true }}
                id='select-role'
                label={<CustomInputLabel htmlFor='select-role' text='Select Role' />}
                {...field}
                error={Boolean(errors?.roleId) || !!apiErrors?.roleId || !!apiErrors?.roleName}
                helperText={errors?.roleId?.message || apiErrors?.roleId || apiErrors?.roleName}
              >
                {Array.isArray(userRoles) && userRoles?.map(role => (
                  <MenuItem value={role?.id} key={role?.id}>
                    {role?.roleName}
                  </MenuItem>
                ))}
              </TextFieldStyled>
            )}
          />
          <Controller
            name='profileStatus'
            control={control}
            rules={{ required: registerData.statusReq }}
            defaultValue=''
            render={({ field }) => (
              <TextFieldStyled
                select
                fullWidth
                id='select-status'
                label={<CustomInputLabel htmlFor='select-status' text='Select Status' />}
                variant='filled'
                InputLabelProps={{ shrink: true }}
                {...field}
                error={Boolean(errors?.profileStatus) || !!apiErrors?.profileStatus}
                helperText={errors?.profileStatus?.message || apiErrors?.profileStatus}
              >
                {profileStatus?.map(profile => (
                  <MenuItem value={profile.status.toLowerCase()} key={profile.id}>
                    {profile.status}
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

AddUserDrawer.propTypes = {
  open: PropTypes.any,
  handleClose: PropTypes.func,
  onUserAdded: PropTypes.func,
};
export default AddUserDrawer
