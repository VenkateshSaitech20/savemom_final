"use client";
import Grid from '@mui/material/Grid';
import SubUserPermission from '@/utils/SubUserPermission';
import PaymentGatewayListTable from './PaymentGatewayListTable';

const PaymentGatewayList = () => {
    const { configureSubscriptionPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PaymentGatewayListTable configureSubscriptionPermission={configureSubscriptionPermission} />
            </Grid>
        </Grid>
    )
}

export default PaymentGatewayList
