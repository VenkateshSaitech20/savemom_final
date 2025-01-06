'use client'
import Grid from '@mui/material/Grid';
import CityTable from './CityTable';
import SubUserPermission from '@/utils/SubUserPermission';

const City = () => {
    const { masterSettingsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <CityTable masterSettingsPermission={masterSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default City
