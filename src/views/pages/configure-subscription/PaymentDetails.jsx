'use client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import { useParams, useRouter } from 'next/navigation';;
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import EditPaymentGatewayInfo from '@/components/dialogs/edit-payment-gateway';
import { getLocalizedUrl } from '@/utils/i18n';
import { showToast } from '@/utils/helper';

const PaymentDetail = () => {
    const [gatewayData, setGatewayData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const { lang: locale } = useParams();

    const getPaymentGatewayDetail = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/configure-subscription/get-by-id', { id });
        if (response?.data?.result === true) {
            setGatewayData(response?.data?.message);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getPaymentGatewayDetail();
    }, []);

    const buttonProps = (children, color, variant) => ({
        children,
        color,
        variant
    });
    const handleGatewayUpdate = (updatedFields) => {
        setGatewayData(updatedFields)
    };
    const handleBack = () => {
        const url = getLocalizedUrl(`/pages/configure-subscription/`, locale)
        router.push(url);
    }

    return (
        <Card>
            {isLoading && (<div className='my-4'>
                <Loader size='lg' />
            </div>)}
            {!isLoading && (<CardContent className='flex flex-col pbs-12 gap-6'>
                <div>
                    <Typography variant='h5'>Details</Typography>
                    <Divider className='mlb-4' />
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Name:</Typography>
                            <Typography>{gatewayData?.name}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Public Key:</Typography>
                            <Typography>{gatewayData.publicKey}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Private Key:</Typography>
                            <Typography color='text.primary'>{gatewayData.privateKey}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Type:</Typography>
                            <Typography color='text.primary'>{gatewayData.type}</Typography>
                        </div>
                    </div>
                </div>
                <div className='flex gap-4 justify-center'>
                    <OpenDialogOnElementClick
                        element={Button}
                        elementProps={buttonProps('Edit', 'primary', 'contained')}
                        dialog={EditPaymentGatewayInfo}
                        dialogProps={{ data: gatewayData, id: id, handleGatewayUpdate, showToast }}
                    />
                    <Button variant='tonal' color='secondary' onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>)}
        </Card>
    )
}

export default PaymentDetail
