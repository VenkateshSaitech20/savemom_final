'use client'
import Grid from '@mui/material/Grid';
import StateTable from './StateTable';
import SubUserPermission from '@/utils/SubUserPermission';

const State = () => {
    const { masterSettingsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <StateTable masterSettingsPermission={masterSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default State
