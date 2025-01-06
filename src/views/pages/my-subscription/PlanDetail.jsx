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
import EditPackagePlan from '@/components/dialogs/edit-package-plan';
import { getLocalizedUrl } from '@/utils/i18n';

const PlanDetail = () => {
    const [planData, setPlanData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const { id } = useParams();
    const router = useRouter();
    const { lang: locale } = useParams();
    const defaultImg = "/images/default-images/pricing-basic.png"

    const getPlanDetail = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/package-plans/get-by-id', { id });
        if (response.data.result === true) {
            setPlanData(response.data.message);
            setIsLoading(false);
        };
    }, []);
    const getRoleList = async () => {
        const response = await apiClient.post("/api/package-plans/list");
        if (response?.data?.result) {
            setAssignedRoles(response.data.message)
        }
    };

    useEffect(() => {
        getPlanDetail();
        getRoleList();
    }, []);

    const buttonProps = (children, color, variant) => ({
        children,
        color,
        variant
    });

    const handlePackageUpdate = (updatedFields) => {
        setPlanData(updatedFields)
    };

    const handleBack = () => {
        const url = getLocalizedUrl(`/pages/my-subscription/`, locale)
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
                            <CustomAvatar alt='plan-image' src={planData?.image || defaultImg} variant='rounded' size={100} />
                        </div>
                    </div>
                </div>
                <div>
                    <Typography variant='h5'>Details</Typography>
                    <Divider className='mlb-4' />
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Title:</Typography>
                            <Typography>{planData.title}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Sub Title:</Typography>
                            <Typography>{planData.subTitle}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Monthly Price:</Typography>
                            <Typography>₹ {planData.monthlyPrice}</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Yearly Price:</Typography>
                            <Typography>₹ {planData?.yearlyPlan?.monthly}/month - ₹ {planData?.yearlyPlan?.annually}/year</Typography>
                        </div>
                        <div className='flex items-center flex-wrap gap-x-1.5'>
                            <Typography variant='h6'>Role Name:</Typography>
                            <Typography>{planData.roleName}</Typography>
                        </div>
                        <Typography variant='h6'>Features:</Typography>
                        {planData?.planBenefits?.map((item) => (
                            <div className='flex items-center flex-wrap gap-x-1.5 ml-5' key={item.feature}>
                                <span>•</span><Typography>{item.feature}</Typography>
                            </div>
                        ))}

                    </div>
                </div>
                <div className='flex gap-4 justify-center'>
                    <OpenDialogOnElementClick
                        element={Button}
                        elementProps={buttonProps('Edit', 'primary', 'contained')}
                        dialog={EditPackagePlan}
                        dialogProps={{ data: planData, id: id, handlePackageUpdate }}
                    />
                    <Button variant='tonal' color='secondary' onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>)}
        </Card>
    )
}

export default PlanDetail
