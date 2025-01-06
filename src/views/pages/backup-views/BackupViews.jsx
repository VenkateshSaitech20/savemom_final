'use client'
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Loader from '@/components/loader';
import { useForm } from 'react-hook-form';
import TextFieldStyled from '@/@core/components/mui/TextField';
import CustomInputLabel from '@/components/asterick';
import { registerData } from '@/utils/message';
import { Typography } from '@mui/material';

const BackupViews = () => {
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [apiErrors, setApiErrors] = useState({});

    const handleDownload = async (data) => {
        setApiErrors({});
        data.token = sessionStorage.getItem("token");
        try {
            setIsButtonLoading(true);
            const response = await fetch('/api/download-db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const apiResp = await response.json();
                if (apiResp?.result === false) {
                    setIsButtonLoading(false);
                    setApiErrors(apiResp?.message);
                    return
                } else {
                    setApiErrors({ error: 'Invalid database credentials. Please check your database configuration.' });
                }
                throw new Error('Network response was not ok');
            }
            if (response?.status === 200) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // a.download = 'savemom.sql';
                a.download = data.dbName + '.sql';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setIsButtonLoading(false);
                return
            }
        } catch (error) {
            setIsButtonLoading(false);
            // console.error('Error downloading database:', error);
        }
    };

    return (
        <Card>
            <CardHeader title='Download file for backup' className='pbe-4' style={{ textAlign: 'center' }} />
            <CardContent>
                <form autoComplete='off' onSubmit={handleSubmit(handleDownload)}>
                    <Grid container spacing={6} justifyContent="center" alignItems="center" style={{ textAlign: 'center', height: '100%' }}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                label={<CustomInputLabel htmlFor='db-host' text='DB Host Name' />}
                                placeholder='Ex: localhost'
                                error={!!errors.dbHostName || apiErrors?.dbHostName}
                                helperText={errors?.dbHostName?.message || apiErrors?.dbHostName}
                                // {...register('dbHostName', { required: registerData.dbHostNameReq, validate: value => value.trim() !== '' || registerData.dbHostNameReq })}
                                {...register('dbHostName')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                label={<CustomInputLabel htmlFor='dbName' text='DB Name' />}
                                placeholder='Enter your database Name'
                                error={!!errors.dbName || apiErrors?.dbName}
                                helperText={errors?.dbName?.message || apiErrors?.dbName}
                                // {...register('dbName', { required: registerData.dbNameReq, validate: value => value.trim() !== '' || registerData.dbNameReq })}
                                {...register('dbName')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                multiline="true"
                                rows={3}
                                label={<CustomInputLabel htmlFor='dbUserName' text='DB User Name' />}
                                placeholder='Enter user name'
                                error={!!errors.dbUserName || apiErrors?.dbUserName}
                                helperText={errors?.dbUserName?.message || apiErrors?.dbUserName}
                                // {...register('dbUserName', { required: registerData.dbUserNameReq, validate: value => value.trim() !== '' || registerData.dbUserNameReq })}
                                {...register('dbUserName')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                multiline="true"
                                rows={3}
                                // label={<CustomInputLabel htmlFor='dbPassword' text='DB Password' />}
                                label="DB Password"
                                placeholder='Enter your database password'
                                error={!!errors.dbPassword || apiErrors?.dbPassword}
                                helperText={errors?.dbPassword?.message || apiErrors?.dbPassword}
                                // {...register('dbPassword', { required: registerData.dbPasswordReq, validate: value => value.trim() !== '' || registerData.dbPasswordReq })}
                                {...register('dbPassword')}
                            />
                        </Grid>
                        <Grid item xs={12} className='flex flex-col gap-6'>
                            {apiErrors?.error && (
                                <div className='plb-3 pli-6'>
                                    <Typography variant="body2" color="error" className="mt-1">{apiErrors.error}</Typography>
                                </div>
                            )}
                            <Button variant='contained' type="submit">
                                {isButtonLoading ? <Loader type="btnLoader" /> : 'Download file'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card >
    )
}

export default BackupViews
