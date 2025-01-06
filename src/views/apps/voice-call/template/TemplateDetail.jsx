'use client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import EditTemplateInfo from '@/components/dialogs/edit-template-info';
import { getLocalizedUrl } from '@/utils/i18n';
import SubUserPermission from '@/utils/SubUserPermission';

const TemplateDetail = () => {
    const [templateData, setTemplateData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const { lang: locale } = useParams();
    const { voiceCallPermission } = SubUserPermission();

    const getTemplateDetail = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/voice-call/template/get-template-by-id', { id });
        if (response.data.result === true) {
            setTemplateData(response.data.message);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getTemplateDetail();
    }, []);

    const buttonProps = (children, color, variant) => ({
        children,
        color,
        variant
    });

    const handleTemplateUpdate = (updatedFields) => {
        setTemplateData(updatedFields)
    };

    const handleBack = () => {
        const url = getLocalizedUrl('/apps/voice-call', locale);
        router.push(url);
    }

    return (
        <Card>
            {isLoading && (<div className='my-4'>
                <Loader size='lg' />
            </div>)}
            {!isLoading && (<CardContent className='flex flex-col pbs-12 gap-6'>
                <div>
                    <Typography variant='h5'>Template Details</Typography>
                    <Divider className='mlb-4' />
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Category:</Typography>
                            <Typography color='text.primary'>{templateData.category}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Message:</Typography>
                            <Typography color='text.primary'>{templateData.message}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Status:</Typography>
                            <Typography color='text.primary'>{templateData.isActive === "Y" ? "Active" : "In Active"}</Typography>
                        </div>
                    </div>
                </div>
                <div className='flex gap-4 justify-center'>
                    {((voiceCallPermission?.editPermission === "Y")) && (
                        <OpenDialogOnElementClick
                            element={Button}
                            elementProps={buttonProps('Edit', 'primary', 'contained')}
                            dialog={EditTemplateInfo}
                            dialogProps={{ data: templateData, id: id, handleTemplateUpdate, emailPermission: voiceCallPermission, flag: 'voice-call' }}
                        />
                    )}
                    <Button variant='tonal' color='secondary' onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>)}
        </Card>
    )
}

export default TemplateDetail
