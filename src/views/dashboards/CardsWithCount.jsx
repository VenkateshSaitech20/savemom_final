'use client'
import CustomAvatar from '@/@core/components/mui/Avatar';
import { Grid, Card as MuiCard, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';
import Loader from '@/components/loader';
import { sessionUserDetail } from '@/utils/helper';
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
const CardsWithCount = () => {
    const [roleCnt, setRoleCnt] = useState('');
    const [userCnt, setUserCnt] = useState('');
    const [planCnt, setPlanCnt] = useState('');
    const [enqCnt, setEnqCnt] = useState('');
    const [subscribeCnt, setSubscribeCnt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userDetail, setUserDetail] = useState({});
    const getDashboardData = async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/dashboard/get-count');
        if (response.data.result === true) {
            setIsLoading(false);
            setRoleCnt(response.data.roleCnt);
            setUserCnt(response.data.userCnt);
            setPlanCnt(response.data.planCnt);
            setEnqCnt(response.data.enqCnt);
            setSubscribeCnt(response.data.subscribeCnt);
            const decoded = sessionUserDetail();
            setUserDetail(decoded.userDetail);
        } else {
            setRoleCnt('');
            setUserCnt('');
            setPlanCnt('');
        }
    }
    useEffect(() => {
        getDashboardData();
    }, []);
    // console.log('userDetail', userDetail)
    return (
        <>
            <Grid item xs={12} md={4}>
                <Card color='primary'>
                    <CardContent className='flex flex-col gap-2'>
                        <div className='flex items-center gap-4'>
                            <CustomAvatar color='primary' skin='light' variant='rounded' size={40}>
                                <i className='bx-bxs-briefcase' />
                            </CustomAvatar>
                            <Typography variant='h4'>{isLoading ? <Loader type="btnLoader" /> : roleCnt}</Typography>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Typography>Total Roles</Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card color='success'>
                    <CardContent className='flex flex-col gap-2'>
                        <div className='flex items-center gap-4'>
                            <CustomAvatar color='success' skin='light' variant='rounded' size={40}>
                                <i className='bx-bxs-user' />
                            </CustomAvatar>
                            <Typography variant='h4'>{isLoading ? <Loader type="btnLoader" /> : userCnt}</Typography>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Typography>Total Users</Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            {userDetail.roleId === "1" && (
                <>
                    <Grid item xs={12} md={4}>
                        <Card color='info'>
                            <CardContent className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <CustomAvatar color='info' skin='light' variant='rounded' size={40}>
                                        <i className='bx-bxs-category' />
                                    </CustomAvatar>
                                    <Typography variant='h4'>{isLoading ? <Loader type="btnLoader" /> : 0}</Typography>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Typography>Total Category</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card color='warning'>
                            <CardContent className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <CustomAvatar color='warning' skin='light' variant='rounded' size={40}>
                                        <i className='bx-bxs-detail' />
                                    </CustomAvatar>
                                    <Typography variant='h4'>{isLoading ? <Loader type="btnLoader" /> : planCnt}</Typography>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Typography>Total Plans</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card color='secondary'>
                            <CardContent className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <CustomAvatar color='secondary' skin='light' variant='rounded' size={40}>
                                        <i className='bx-bxs-message-rounded-detail' />
                                    </CustomAvatar>
                                    <Typography variant='h4'>{isLoading ? <Loader type="btnLoader" /> : enqCnt}</Typography>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Typography>Total Enquiries</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card color='error'>
                            <CardContent className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <CustomAvatar color='error' skin='light' variant='rounded' size={40}>
                                        <i className='bx-money' />
                                    </CustomAvatar>
                                    <Typography variant='h4'>{isLoading ? <Loader type="btnLoader" /> : subscribeCnt}</Typography>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Typography>Total Subscribers</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </>
            )}
        </>
    )
}
export default CardsWithCount
