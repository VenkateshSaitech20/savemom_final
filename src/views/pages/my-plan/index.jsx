'use client'
import { useCallback, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import classnames from 'classnames';
import CustomAvatar from '@core/components/mui/Avatar';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import Script from 'next/script';
import { registerData, responseData, rupeeSymbol } from '@/utils/message';
import { signOut } from 'next-auth/react';
import { getDate } from '@/utils/helper';

const PricingPlanDetail = () => {
    const [pricingPlan, setPricingPlan] = useState('annually');
    const [planList, setPlanList] = useState([]);
    const [paymentDetails, setPaymentDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [purchaseId, setPurchaseId] = useState('');

    const getData = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.get('/api/website-settings/package-plans');
        const getpaymentDetails = await apiClient.get('/api/configure-subscription/get-by-id');
        if (getpaymentDetails?.data?.result) {
            setPaymentDetails(getpaymentDetails?.data?.message);
        };
        if (response?.data?.result) {
            setPlanList(response?.data?.message);
        };
        if (response?.data?.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        };
        setIsLoading(false);
        setPurchaseId('');
    }, []);

    useEffect(() => {
        getData();
    }, []);

    const createOrder = async (currency, packagePlanId, packagePlanType) => {
        setIsButtonDisabled(true);
        const postData = { currency, packagePlanId, packagePlanType };
        const response = await apiClient.post('/api/payment/buy-subscription', postData);
        if (response?.data?.result) {
            return response.data.message
        }
        if (response?.data?.result === false && response?.data?.message?.error?.description === "Authentication failed") {
            setApiErrors(response?.data?.message?.error);
        }
        setIsButtonDisabled(false);
        setPurchaseId('');
    };
    const verifyPayment = async (postData) => {
        setIsLoading(true);
        await apiClient.post('/api/payment/verify', postData);
        setIsLoading(false);
        setIsButtonDisabled(false);
        if (paymentDetails.userDetail.adminApprovalId === "2") {
            window.location.reload();
        }
    };
    const processPayment = async (id) => {
        if (isButtonDisabled === true || purchaseId !== "") { return };
        setPurchaseId(id);
        setApiErrors({});
        let currency = "INR";
        if (paymentDetails?.paymentKeys?.name.match(/razorpay/i)) {
            const orderId = await createOrder(currency, id, pricingPlan);
            if (orderId) {
                const options = {
                    key: paymentDetails?.subscriptionDetail?.publicKey,
                    currency: 'INR',
                    name: paymentDetails?.userDetail?.name,
                    description: 'Buy new plan',
                    order_id: orderId.paymentId,
                    handler: async function (response) {
                        const razorpayPaymentId = response.razorpay_payment_id;
                        const orderCreationId = response.razorpay_order_id;
                        const razorpaySignature = response.razorpay_signature;
                        const postData = { orderCreationId, razorpayPaymentId, razorpaySignature, id };
                        // console.log('postData', postData)
                        await verifyPayment(postData);
                        getData();
                    },
                    prefill: {
                        name: paymentDetails?.userDetail?.name,
                        email: paymentDetails?.userDetail?.email,
                        contact: paymentDetails?.userDetail?.contactNo,
                    },
                    theme: {
                        color: '#F37254',
                    },
                    modal: {
                        ondismiss: function () {
                            setIsButtonDisabled(false);
                            setPurchaseId("");
                        }
                    }
                };
                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } else {
                setApiErrors({ keyNotValid: responseData?.paymentConfigErrMsg })
                setIsButtonDisabled(false);
                setPurchaseId('');
            }
        } else if (paymentDetails?.paymentKeys?.name.match(/phonepe/i)) {
            // console.log('first', postData)
            // const response = await apiClient.post('/api/payment/buy-subscription', postData);
            // if (response?.data?.result) {
            //     return response.data.message
            // }
        } else if (paymentDetails?.paymentKeys === null) {
            setApiErrors({ keyNotValid: responseData?.paymentConfigErrMsg })
            setIsButtonDisabled(false);
            setPurchaseId('');
        }
    }

    return (
        <>
            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
            {isLoading && <Loader />}
            {!isLoading && (
                <section
                    id='pricing-plans'
                    className={'flex flex-col gap-8 lg:gap-12  bg-backgroundDefault rounded-[60px]'}
                >
                    <div className={classnames('is-full', frontCommonStyles.layoutSpacing)}>
                        <div className='flex justify-center items-center gap-3 max-sm:mlb-4 mbe-4'>
                            <InputLabel htmlFor='pricing-switch' className='cursor-pointer'>
                                Pay Monthly
                            </InputLabel>
                            <Switch id='pricing-switch' onChange={e => setPricingPlan(e.target.checked ? 'annually' : 'monthly')} checked={pricingPlan === 'annually'} />
                            <InputLabel htmlFor='pricing-switch' className='cursor-pointer'>
                                Pay Annually (Save {paymentDetails?.discountDetail?.discount ?? 0}%)
                            </InputLabel>
                        </div>
                        {paymentDetails?.userDetail?.isExpired === "Y" && (<InputLabel htmlFor='plan-expiray' className='flex justify-center max-sm:mlb-4 mbe-4 text-red-500'>
                            {registerData.planExpirationMsg}
                        </InputLabel>)}
                        {(paymentDetails?.userDetail?.isExpired === null && paymentDetails?.userDetail.roleId !== "1") && (<InputLabel htmlFor='plan-expiray' className='flex justify-center max-sm:mlb-4 mbe-4 text-red-500'>
                            {registerData.noPlanMsg}
                        </InputLabel>)}
                        {paymentDetails?.userDetail?.adminApprovalId === '4' && (<InputLabel htmlFor='plan-expiray' className='flex justify-center max-sm:mlb-4 mbe-4 text-green-500'>
                            {registerData.planApprovalMsg}
                        </InputLabel>)}
                        {planList.length < 1 && (<p className='text-center'>No Plans available</p>)}
                        <Grid container spacing={6}>
                            {planList?.map((plan) => {
                                const currentPlan = plan.id === paymentDetails?.userDetail?.packageId;
                                const loadingId = plan.id === purchaseId;
                                return (
                                    <Grid item key={plan.id} xs={12} lg={4}>
                                        <Card className={classnames({ 'border-2 border-primary shadow-xl': currentPlan })}>
                                            <CardContent className='flex flex-col gap-8 p-8 pbs-12'>
                                                <div className='is-full flex flex-col items-center gap-3'>
                                                    <img src={plan.image} alt={plan.image} height='88' width='86' className='text-center' />
                                                </div>
                                                <div className='flex flex-col items-center gap-0.5 plb-2.5 relative'>
                                                    <Typography className='text-center' variant='h4'>
                                                        {plan.title}
                                                    </Typography>
                                                    <Typography className='text-center' variant='h6'>{plan.subTitle}</Typography>
                                                    <div className='flex items-baseline gap-1'>
                                                        <Typography variant='h2' color='primary' className='font-extrabold'>
                                                            {rupeeSymbol.IND} {pricingPlan === 'monthly' ? plan.monthlyPrice : plan.yearlyPlan.monthly}
                                                        </Typography>
                                                        <Typography color='text.disabled' className='font-medium'>
                                                            /mo
                                                        </Typography>
                                                    </div>
                                                    {pricingPlan === 'annually' && (
                                                        <Typography variant='caption' className='absolute block-end-[-9px]'>
                                                            {rupeeSymbol.IND}{plan.yearlyPlan.annually} / year
                                                        </Typography>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className='flex flex-col gap-3'>
                                                        {plan?.planBenefits?.map((plan, index) => (
                                                            <div key={index} className='flex items-center gap-2.5'>
                                                                <CustomAvatar color='primary' skin={currentPlan ? 'filled' : 'light'} size={16}>
                                                                    <i className='bx-check text-xs' />
                                                                </CustomAvatar>
                                                                <Typography variant='h6'>{plan.feature}</Typography>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {((paymentDetails?.userDetail?.isExpired === "Y" && paymentDetails?.userDetail?.id === paymentDetails?.userDetail?.createdBy) || (paymentDetails?.userDetail?.isExpired === null && paymentDetails?.userDetail?.roleId !== "1")) && (<Button variant={'contained'} onClick={() => processPayment(plan.id)}>
                                                    {loadingId ? <Loader type='btnLoader' /> : "Buy Now"}
                                                </Button>)}
                                                {currentPlan && (
                                                    <>
                                                        <div className='flex justify-center'>
                                                            <Typography variant='h6'>Valid till: {getDate(paymentDetails?.userDetail?.expirayDate)}</Typography>
                                                        </div>
                                                        {apiErrors.description === 'Authentication failed' && (<Typography variant='h6' className='text-red-500'>{responseData?.paymentConfigErrMsg}</Typography>)}
                                                    </>
                                                )}

                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })}

                        </Grid>
                        {apiErrors?.keyNotValid && (<Typography variant='h6' className='text-center text-red-500 mt-4'>{responseData?.paymentConfigErrMsg}</Typography>)}
                    </div>
                </section>
            )}
        </>

    )
}

export default PricingPlanDetail
