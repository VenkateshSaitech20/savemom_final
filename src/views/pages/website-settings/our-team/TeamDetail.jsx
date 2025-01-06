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
import EditTeamInfo from '@/components/dialogs/edit-team-info';
import { getLocalizedUrl } from '@/utils/i18n';
const TeamDetail = () => {
    const [teamData, setTeamData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const { lang: locale } = useParams();
    const defaultImg = "/images/default-images/our-team.png"
    const getUserProfile = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/website-settings/our-team/get-by-id', { id });
        if (response.data.result === true) {
            setTeamData(response.data.message);
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
    const handleTeamUpdate = (updatedFields) => {
        setTeamData(updatedFields)
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
                            <img src={teamData.image || defaultImg} className='w-[110px] h-[120px]' />
                        </div>
                    </div>
                </div>
                <div>
                    <Typography variant='h5'>Details</Typography>
                    <Divider className='mlb-4' />
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Title:</Typography>
                            <Typography color='text.primary'>{teamData.title}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Description:</Typography>
                            <Typography color='text.primary'>{teamData.description}</Typography>
                        </div>
                    </div>
                </div>
                <div className='flex gap-4 justify-center'>
                    <OpenDialogOnElementClick
                        element={Button}
                        elementProps={buttonProps('Edit', 'primary', 'contained')}
                        dialog={EditTeamInfo}
                        dialogProps={{ data: teamData, id: id, handleTeamUpdate }}
                    />
                    <Button variant='tonal' color='secondary' onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>)}
        </Card>
    )
}

export default TeamDetail
