'use client'
import Grid from '@mui/material/Grid';
import CategoryTable from './CategoryTable';
import SubUserPermission from '@/utils/SubUserPermission';

const Category = () => {
    const { categoryPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <CategoryTable categoryPermission={categoryPermission} />
            </Grid>
        </Grid>
    )
}

export default Category
