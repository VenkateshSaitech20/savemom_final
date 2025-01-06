'use client'
import Grid from '@mui/material/Grid';
import SubUserPermission from '@/utils/SubUserPermission';
import PlanTable from './PlanTable';

const Plan = () => {

    const { mySubscriptionPermission } = SubUserPermission();

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PlanTable mySubscriptionPermission={mySubscriptionPermission} />
            </Grid>
        </Grid>
    )
}

export default Plan

