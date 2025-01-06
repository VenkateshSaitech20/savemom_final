'use client'

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import EditUserInfo from '@components/dialogs/edit-user-info';
import ConfirmationDialog from '@components/dialogs/confirmation-dialog';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import CustomAvatar from '@core/components/mui/Avatar';
import { useParams, useRouter } from 'next/navigation';;
import { useCallback, useEffect, useState } from 'react';
import { capitalizeFirstLetter } from '@/utils/helper';
import Loader from '@/components/loader';
import { toast } from 'react-toastify';
import apiClient from '@/utils/apiClient';
import { getLocalizedUrl } from '@/utils/i18n';

const UserDetails = ({ params }) => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const router = useRouter();
  const { lang: locale } = useParams();
  const getUserProfile = useCallback(async () => {
    setIsLoading(true);
    const response = await apiClient.post('/api/sub-user/id', { id });
    if (response.data.result === true) {
      setUserData(response.data.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getUserProfile();
  }, []);

  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  });

  const handleUserDataUpdate = (updatedFields) => {
    setUserData(updatedFields)
  };

  const showToast = (success) => {
    if (success) {
      toast.success("User updated successfully", {
        position: "top-center",
        hideProgressBar: false,
        theme: "dark",
      });
    }
  }

  const handleBack = () => {
    const url = getLocalizedUrl(`/apps/user/list`, locale);
    router.push(url);
  }

  return (
    <Card>
      {isLoading && (<div className='my-4'>
        <Loader size='lg' />
      </div>)}
      {!isLoading && (<CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
              <Typography variant='h5'>{`${userData.name || ''}`}</Typography>
            </div>
          </div>
        </div>
        <div>
          <Typography variant='h5'>Details</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography variant='h6'>Name:</Typography>
              <Typography>{userData.name}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography variant='h6'>Email:</Typography>
              <Typography>{userData.email}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography variant='h6'>Status</Typography>
              <Typography color='text.primary'>{capitalizeFirstLetter(userData.profileStatus)}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography variant='h6'>Role:</Typography>
              <Typography color='text.primary'>{capitalizeFirstLetter(userData.roleName)}</Typography>
            </div>
            {/* <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Tax ID:</Typography>
                <Typography color='text.primary'>{userData.taxId}</Typography>
              </div> */}
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography variant='h6'>Contact:</Typography>
              <Typography color='text.primary'>{userData.contactNo}</Typography>
            </div>
            {/* <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Language:</Typography>
                <Typography color='text.primary'>{userData.language}</Typography>
              </div> */}
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography variant='h6'>Country:</Typography>
              <Typography color='text.primary'>{userData.country}</Typography>
            </div>
          </div>
        </div>
        <div className='flex gap-4 justify-center'>
          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps('Edit', 'primary', 'contained')}
            dialog={EditUserInfo}
            dialogProps={{ data: userData, id: id, handleUserDataUpdate, showToast }}
          />
          {/* <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Suspend', 'error', 'tonal')}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'suspend-account' }}

            /> */}
          <Button variant='tonal' color='secondary' onClick={handleBack}>
            Back
          </Button>
        </div>
      </CardContent>)}
    </Card>
  )
}

export default UserDetails
