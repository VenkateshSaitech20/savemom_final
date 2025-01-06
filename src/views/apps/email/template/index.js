'use client'
import Grid from '@mui/material/Grid';
import EmailTemplateTable from './EmailTemplateTable';
import SubUserPermission from '@/utils/SubUserPermission';

const EmailTemplate = () => {
    const { emailPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <EmailTemplateTable emailPermission={emailPermission} />
            </Grid>
        </Grid>
    )
}

export default EmailTemplate
