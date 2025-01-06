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
import EditContent from '@/components/dialogs/edit-content-info';
import { getLocalizedUrl } from '@/utils/i18n';

const ContentDetail = () => {
    const [contentData, setContentData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const { lang: locale } = useParams();
    const defaultImg = "/images/default-images/pricing-basic.png"

    const getContentDetail = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/content-management/content/get-by-id', { id });
        if (response.data.result === true) {
            setContentData(response.data.message);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getContentDetail();
    }, []);

    const buttonProps = (children, color, variant) => ({
        children,
        color,
        variant
    });

    const handleContentUpdate = (updatedFields) => {
        setContentData(updatedFields)
    };

    const handleBack = () => {
        const url = getLocalizedUrl(`/pages/content-management/content/`, locale)
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
                            {contentData?.image && <CustomAvatar alt='plan-image' src={contentData?.image || defaultImg} variant='rounded' size={100} />}
                        </div>
                    </div>
                </div>
                <div>
                    <Typography variant='h5'>Details</Typography>
                    <Divider className='mlb-4' />
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Title:</Typography>
                            <Typography>{contentData.title}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Category:</Typography>
                            <Typography>{contentData.categoryName}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Short Content:</Typography>
                            <Typography> {contentData.shortContent}</Typography>
                        </div>
                        <div className='gap-x-1.5'>
                            <Typography variant='h6'>Content:</Typography>
                            <Typography
                                component="div"
                                dangerouslySetInnerHTML={{ __html: contentData.content }}
                            />
                        </div>
                    </div>
                </div>
                <div className='flex gap-4 justify-center'>
                    <OpenDialogOnElementClick
                        element={Button}
                        elementProps={buttonProps('Edit', 'primary', 'contained')}
                        dialog={EditContent}
                        dialogProps={{ data: contentData, id: id, handleContentUpdate }}
                    />
                    <Button variant='tonal' color='secondary' onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>)}
        </Card>
    )
}

export default ContentDetail
