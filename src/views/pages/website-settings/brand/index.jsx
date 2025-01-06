'use client'
import Grid from '@mui/material/Grid';
import BrandTable from './BrandTable';
import SubUserPermission from '@/utils/SubUserPermission';
const Brand = () => {
const { websiteSettingsPermission } = SubUserPermission();
return (
        <Grid container spacing={6}>
          
            <Grid item xs={12}>
                <BrandTable websiteSettingsPermission={websiteSettingsPermission} />
            </Grid>
        </Grid>
    )
}
export default Brand
