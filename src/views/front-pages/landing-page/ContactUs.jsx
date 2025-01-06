import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import classnames from 'classnames';
import CustomAvatar from '@core/components/mui/Avatar';
import TextFieldStyled from '@core/components/mui/TextField';
import { useIntersection } from '@/hooks/useIntersection';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import styles from './styles.module.css';
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { useForm } from 'react-hook-form'
import { registerData, validations } from '@/utils/message';

const ContactUs = () => {
    const skipIntersection = useRef(true);
    const ref = useRef(null);
    const { updateIntersections } = useIntersection();
    const [contactUs, setContactUs] = useState('');
    const [contactData, setContactData] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: {} });

    const getContactUs = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/website-settings/contact-us`);
        if (response.data.result === true) {
            if (response.data.message) {
                setContactUs(response.data.message);
            }
        }
        setIsLoading(false);
    };

    const getContactSetting = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/system-settings`);
        if (response?.data?.result === true) {
            setContactData(response.data.message)
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getContactSetting();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (skipIntersection.current) {
                    skipIntersection.current = false
                    return
                }
                updateIntersections({ [entry.target.id]: entry.isIntersecting })
            },
            { threshold: 0.35 }
        )
        ref.current && observer.observe(ref.current)
        getContactUs();
    }, [])

    const handleContactForm = async (data) => {
        setIsButtonLoading(true);
        setApiErrors('');
        const response = await apiClient.post(`/api/customer-enquiries`, { data });
        if (response?.data?.result === true) {
            if (response?.data?.message) {
                setSuccessMsg(response.data.message);
                setApiErrors('');
                reset();
            }
        } else if (response.data.result === false) {
            if (response.data.message) {
                setApiErrors(response.data.message);
            }
        }
        setIsButtonLoading(false);
    }

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => {
                setSuccessMsg('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    return (
        <>
            {
                contactUs.isfrontendvisible === "Y" && (
                    <>
                        {isLoading && <Loader />}
                        {
                            !isLoading && (
                                <section id='contact-us' className='plb-[100px] bg-backgroundDefault' ref={ref}>
                                    <div className={classnames('flex flex-col gap-16', frontCommonStyles.layoutSpacing)}>
                                        <div className='flex flex-col items-center justify-center gap-4'>
                                            <Chip size='small' variant='tonal' color='primary' label={contactUs?.badgeTitle} />
                                            <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
                                                <Typography variant='h4'>
                                                    <span className='relative z-[1] font-extrabold'>
                                                        <img
                                                            src='/images/front-pages/landing-page/bg-shape.png'
                                                            alt='bg-shape'
                                                            className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                                                        />
                                                        {contactUs?.title}
                                                    </span>
                                                </Typography>
                                                <Typography>{contactUs?.description}</Typography>
                                            </div>
                                        </div>
                                        <div className='lg:pis-10'>
                                            <Grid container spacing={6}>
                                                <Grid item xs={12} md={6} lg={5}>
                                                    <div className={classnames('relative border p-[10px]', styles.contactRadius)}>
                                                        <img
                                                            src='/images/front-pages/landing-page/contact-border.png'
                                                            className='absolute -block-start-[8.5%] -inline-start-[9%] max-is-full max-lg:hidden '
                                                            alt='contact-border'
                                                            width='191'
                                                        />
                                                        <img
                                                            src='/images/front-pages/landing-page/customer-service.png'
                                                            alt='customer-service'
                                                            className={classnames('is-full', styles.contactRadius)}
                                                        />
                                                        <div className='flex items-start justify-around flex-wrap gap-4 pli-4 pbs-4 pbe-1.5'>
                                                            <div className='flex items-center gap-3'>
                                                                <CustomAvatar variant='rounded' size={40} skin='light' color='primary'>
                                                                    <i className='bx-envelope' />
                                                                </CustomAvatar>
                                                                <div>
                                                                    <Typography>Email</Typography>
                                                                    <Typography variant='h6'>{contactData?.email}</Typography>
                                                                </div>
                                                            </div>
                                                            <div className='flex items-center gap-3'>
                                                                <CustomAvatar variant='rounded' size={40} skin='light' color='success'>
                                                                    <i className='bx-phone-call' />
                                                                </CustomAvatar>
                                                                <div>
                                                                    <Typography>Phone</Typography>
                                                                    <Typography variant='h6'>{contactData?.contactNo}</Typography>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Grid>
                                                <Grid item xs={12} md={6} lg={7}>
                                                    <Card className='bs-full'>
                                                        <CardContent>
                                                            <div className='flex flex-col gap-1 mbe-6'>
                                                                <Typography variant='h4'>{contactUs?.cardTitle}</Typography>
                                                                <Typography>{contactUs?.cardDescription}</Typography>
                                                            </div>
                                                            <form onSubmit={handleSubmit(handleContactForm)} className='flex flex-col items-start gap-4'>
                                                                <div className='flex max-sm:flex-col gap-4 is-full'>
                                                                    <TextFieldStyled
                                                                        fullWidth
                                                                        label='Full name'
                                                                        id='name-input'
                                                                        variant='filled'
                                                                        InputLabelProps={{ shrink: true }}
                                                                        {...register('name', { required: registerData.nameReq, validate: value => value.trim() !== '' || registerData.nameReq })}
                                                                        error={!!errors.name || !!apiErrors?.name}
                                                                        helperText={errors.name?.message || apiErrors?.name}
                                                                    />
                                                                    <TextFieldStyled
                                                                        fullWidth
                                                                        label='Email address'
                                                                        id='email-input'
                                                                        type='email'
                                                                        variant='filled'
                                                                        InputLabelProps={{ shrink: true }}
                                                                        {...register('email', {
                                                                            required: registerData.emailReq, pattern: {
                                                                                value: validations.emailPattern,
                                                                                message: registerData.emailValMsg,
                                                                            },
                                                                        })}
                                                                        error={!!errors?.email || !!apiErrors?.email}
                                                                        helperText={errors?.email?.message || apiErrors?.email}
                                                                    />
                                                                </div>
                                                                <TextFieldStyled
                                                                    fullWidth
                                                                    multiline
                                                                    rows={5}
                                                                    label='Message'
                                                                    id='message-input'
                                                                    variant='filled'
                                                                    InputLabelProps={{ shrink: true }}
                                                                    {...register('message', { required: registerData.messageReq, validate: value => value.trim() !== '' || registerData.messageReq })}
                                                                    error={!!errors.message || !!apiErrors?.message}
                                                                    helperText={errors.message?.message || apiErrors?.message}
                                                                />
                                                                {successMsg && (<Typography variant='h5' sx={{ color: 'green' }}>{successMsg}</Typography>)}
                                                                <Button type="submit" variant='contained'>
                                                                    {isButtonLoading ? <Loader type="btnLoader" /> : "Send Inquiry"}
                                                                </Button>
                                                            </form>

                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    </div>
                                </section>
                            )
                        }
                    </>
                )}
        </>


    )
}

export default ContactUs
