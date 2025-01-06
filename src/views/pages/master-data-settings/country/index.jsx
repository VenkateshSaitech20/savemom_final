'use client'
import Grid from '@mui/material/Grid';
import CountryTable from './CountryTable';
import SubUserPermission from '@/utils/SubUserPermission';

const Country = () => {
    const { masterSettingsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <CountryTable masterSettingsPermission={masterSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default Country
