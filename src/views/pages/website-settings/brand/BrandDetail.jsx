'use client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import CustomAvatar from '@core/components/mui/Avatar';
import { useParams } from 'next/navigation';;
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import EditBrandInfo from '@/components/dialogs/edit-brand-info';

const BrandDetail = () => {
    const [brandData, setBrandData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const getUserProfile = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/website-settings/brand/get-by-id', { id });
        if (response.data.result === true) {
            setBrandData(response.data.message);
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
    const handleBrandUpdate = (updatedFields) => {
        setBrandData(updatedFields)
    };

    return (
        <Card>
            {isLoading && (<div className='my-4'>
                <Loader size='lg' />
            </div>)}
            {!isLoading && (<CardContent className='flex flex-col pbs-12 gap-6'>
                <div className='flex flex-col gap-6'>
                    <div className='flex items-center justify-center flex-col gap-4'>
                        <div className='flex flex-col items-center gap-4'>
                            <CustomAvatar alt='user-image' src={defaultImg} variant='rounded' className='w-[100px] h-[30px]' />

                            <img height={100} width={100} className='rounded ' src={row?.original?.image} alt={row?.original?.image} />
                        </div>
                    </div>
                </div>
                <div>
                    <Typography variant='h5'>Details</Typography>
                    <Divider className='mlb-4' />
                </div>
                <div className='flex gap-4 justify-center'>
                    <OpenDialogOnElementClick
                        element={Button}
                        elementProps={buttonProps('Edit', 'primary', 'contained')}
                        dialog={EditBrandInfo}
                        dialogProps={{ data: brandData, id: id, handleBrandUpdate }}
                    />
                </div>
            </CardContent>)}
        </Card>
    )
}

export default BrandDetail
