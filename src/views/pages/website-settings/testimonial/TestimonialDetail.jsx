'use client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import CustomAvatar from '@core/components/mui/Avatar';
import { useParams, useRouter } from 'next/navigation';;
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import EditTestimonialInfo from '@/components/dialogs/edit-testimonial-info';
import { getLocalizedUrl } from '@/utils/i18n';
const TestimonialDetail = () => {
    const [testimonialData, setTestimonialData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const defaultImg = "/images/default-images/testimonial-company.png";
    const { lang: locale } = useParams();

    const getUserProfile = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/website-settings/testimonial/get-by-id', { id });
        if (response.data.result === true) {
            setTestimonialData(response.data.message);
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
    const handleTestimonialUpdate = (updatedFields) => {
        setTestimonialData(updatedFields)
    };

    const handleBack = () => {
        const url = getLocalizedUrl(`/pages/website-settings`, locale);
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
                            <CustomAvatar alt='user-profile' src={testimonialData.image || defaultImg} variant='rounded' className='w-[100px] h-[30px]' />
                            <Typography variant='h5'>{`${testimonialData.postedBy || ''}`}</Typography>
                        </div>
                    </div>
                </div>
                <div>
                    <Typography variant='h5'>Details</Typography>
                    <Divider className='mlb-4' />
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Posted By:</Typography>
                            <Typography>{testimonialData.postedBy}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Designation:</Typography>
                            <Typography>{testimonialData.designation}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Rating:</Typography>
                            <Typography color='text.primary'>{testimonialData.rating}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Description:</Typography>
                            <Typography color='text.primary'>{testimonialData.description}</Typography>
                        </div>
                    </div>
                </div>
                <div className='flex gap-4 justify-center'>
                    <OpenDialogOnElementClick
                        element={Button}
                        elementProps={buttonProps('Edit', 'primary', 'contained')}
                        dialog={EditTestimonialInfo}
                        dialogProps={{ data: testimonialData, id: id, handleTestimonialUpdate }}
                    />
                    <Button variant='tonal' color='secondary' onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>)}
        </Card>
    )
}

export default TestimonialDetail
