'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextFieldStyled from '@core/components/mui/TextField';
import { Controller, useForm } from 'react-hook-form';
import { languages, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import SubUserPermission from '@/utils/SubUserPermission';

const SelectLanguage = () => {
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, control, setValue } = useForm();
    const { } = SubUserPermission();

    const handleProfileEdit = async (data) => {
        if (apiErrors.profileImage) {
            return;
        }
        const response = await apiClient.put('/api/profile', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            setIsButtonLoading(true);
            showToast(true, responseData.profileUpdated);
            getUserProfile();
            setApiErrors({});
            setIsButtonLoading(false);
        } else {
            setApiErrors(response.data.message);
            setIsButtonLoading(false);
        }
    };

    const getUserProfile = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/profile`);
        if (response.data.result === true) {
            const { country } = response.data.message;
            setValue('country', country);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getUserProfile();
    }, []);

    return (
        <Card>
            {isLoading && <div className='my-4'><Loader /></div>}
            {!isLoading && (
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleProfileEdit)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name='Language'
                                    control={control}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <TextFieldStyled
                                            select
                                            fullWidth
                                            id='select-language'
                                            label='Select Language'
                                            size="small"
                                            variant='filled'
                                            InputLabelProps={{ shrink: true }}
                                            {...field}
                                        >
                                            <MenuItem value='' disabled>
                                                Select a language
                                            </MenuItem>
                                            {languages?.map((lang) => (
                                                <MenuItem value={lang.name} key={lang.id}>
                                                    {lang.name}
                                                </MenuItem>
                                            ))}
                                        </TextFieldStyled>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                <Button variant='contained' type='submit'>
                                    {isButtonLoading ? <Loader type="btnLoader" /> : "Save Changes"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            )
            }
        </Card>
    )
}

export default SelectLanguage
