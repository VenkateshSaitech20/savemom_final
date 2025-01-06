'use client'
import { Grid, Card as MuiCard, CardContent, Typography, CardHeader, Chip, Avatar } from '@mui/material';
import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';
import Loader from '@/components/loader';
import { convertStrToUpper } from '@/utils/helper';
import { styled } from '@mui/material/styles';
const Card = styled(MuiCard)(({ color }) => ({
    transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
    borderBottomWidth: '3px',
    borderBottomColor: `var(--mui-palette-${color}-darkerOpacity)`,
    '[data-skin="bordered"] &:hover': {
        boxShadow: 'none'
    },
    '&:hover': {
        borderBottomWidth: '3px',
        borderBottomColor: `var(--mui-palette-${color}-main) !important`,
        boxShadow: 'var(--mui-customShadows-xl)',
        marginBlockEnd: '-1px'
    }
}))
const CardsWithTable = () => {
    const [payMethods, setPayMethods] = useState([]);
    const [landPageContent, setLandPageContent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const getDashboardTableData = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/dashboard/get-table-data');
        if (response.data.result === true) {
            setIsLoading(false);
            if (response.data.payMethods) {
                setPayMethods(response.data.payMethods);
            }
            if (response.data.landPageContent) {
                setLandPageContent(response.data.landPageContent);
            }
        } else {
            setPayMethods([]);
            setLandPageContent([]);
            setIsLoading(false);
        }
    }
    useEffect(() => {
        getDashboardTableData();
    }, []);
    return (
        <>
            {payMethods?.length > 0 && (
                <Grid item xs={12} md={12}>
                    <Card color='primary'>
                        <CardHeader title='Payment Methods' />
                        {isLoading && <div className='my-4'><Loader /></div>}
                        {!isLoading && (
                            <CardContent className='flex flex-col gap-6'>
                                {payMethods?.map((item, index) => (
                                    <div key={item.id} className='flex items-center gap-3'>
                                        <Avatar src='/images/cards/dashboard/wallet.png' alt={item.name} variant='rounded' />
                                        <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full'>
                                            <div className='flex flex-col items-start'>
                                                <Typography color='text.primary'>{item?.name}</Typography>
                                                <Typography variant='body2'>{item?.type}</Typography>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Typography color='text.disabled'>{item?.isActive === 'Y' ? (<Chip label='Active' variant='tonal' size='small' color='success' className='self-start' />) : (<Chip label='Inactive' variant='tonal' size='small' color='error' className='self-start' />)}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                </Grid>
            )}
            {landPageContent?.length > 0 && (
                <Grid item xs={12} md={12}>
                    <Card color='info'>
                        <CardHeader title='Landing Page Content' />
                        {isLoading && <div className='my-4'><Loader /></div>}
                        {!isLoading && (
                            <CardContent className='flex flex-col gap-6'>
                                {landPageContent?.map((item, index) => (
                                    <div key={item.id} className='flex items-center gap-3'>
                                        <Avatar src='/images/cards/dashboard/monitor.png' alt={item.sectionType} variant='rounded' />
                                        <div className='flex flex-wrap justify-between items-center gap-x-1 gap-y-1 is-full'>
                                            <div className='flex flex-col items-start'>
                                                <Typography color='text.primary'>{convertStrToUpper(item.sectionType)}</Typography>
                                                {/* <Chip label={item.badgeTitle !== null ? item.badgeTitle : convertStrToUpper(item.sectionType)} variant='tonal' size='small' color='secondary' className='self-start' /> */}
                                            </div>
                                            <div className='flex items-center'>
                                                <Typography>{item?.isfrontendvisible === 'Y' ? (<Chip label='Visible' variant='tonal' size='small' color='success' className='self-start' />) : (<Chip label='Not Visible' variant='tonal' size='small' color='error' className='self-start' />)}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                </Grid>
            )}
        </>
    )
}
export default CardsWithTable
