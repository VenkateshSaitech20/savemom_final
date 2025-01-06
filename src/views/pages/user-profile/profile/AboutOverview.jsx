"use client"
// MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import { capitalizeFirstLetter } from '@/utils/helper';

const AboutOverview = () => {
    const [userProfile, setUserProfile] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const getUserProfile = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/profile`);
        if (response.data.result === true) {
            if (response.data.message) {
                const data = response.data.message;
                setUserProfile(data);
                setIsLoading(false);
            }
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getUserProfile();
    }, []);

    return (
        <>
            {isLoading ? <Loader /> : (
                <Grid container spacing={6}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent className='flex flex-col gap-6'>
                                <div className='flex flex-col gap-4'>
                                    <Typography className='uppercase' variant='body2' color='text.disabled'>
                                        About
                                    </Typography>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-user', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Full Name : </Typography>
                                            <Typography>{userProfile?.name}</Typography>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-check', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Status : </Typography>
                                            <Typography>{userProfile?.profileStatus ? capitalizeFirstLetter(userProfile?.profileStatus) : 'Active'}</Typography>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-star', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Role : </Typography>
                                            <Typography>{userProfile?.roleName ? capitalizeFirstLetter(userProfile?.roleName) : ''}</Typography>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-flag', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Address : </Typography>
                                            <Typography>
                                                {userProfile?.address ? userProfile?.address : ''}
                                                {userProfile?.address && userProfile?.state ? ', ' : ''}
                                                {userProfile?.state ? userProfile?.state : ''}
                                                {userProfile?.address && userProfile?.state ? ', ' : ''}
                                                {userProfile?.country ? userProfile?.country : ''}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-buildings', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Company : </Typography>
                                            <Typography>{userProfile?.companyName ? userProfile?.companyName : ''}</Typography>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <Typography className='uppercase' variant='body2' color='text.disabled'>Contacts</Typography>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-envelope', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Email : </Typography>
                                            <Typography>{userProfile?.email ? userProfile?.email : ''}</Typography>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <i className={classnames('bx-phone-call', 'text-xl')} />
                                        <div className='flex items-center flex-wrap gap-2'>
                                            <Typography className='font-medium'>Contact : </Typography>
                                            <Typography>{userProfile?.contactNo ? userProfile?.contactNo : ''}</Typography>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </>

    )
}

export default AboutOverview
