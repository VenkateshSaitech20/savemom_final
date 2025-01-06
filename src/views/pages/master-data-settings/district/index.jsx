'use client'
import Grid from '@mui/material/Grid';
import DistrictTable from './DistrictTable';
import SubUserPermission from '@/utils/SubUserPermission';
const District = () => {
    const { masterSettingsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <DistrictTable masterSettingsPermission={masterSettingsPermission} />
            </Grid>
        </Grid>
    )
}
export default District
