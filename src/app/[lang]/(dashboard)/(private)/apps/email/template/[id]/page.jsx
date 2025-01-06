import Grid from '@mui/material/Grid'
import EmailTemplateDetail from '@views/apps/email/template/EmailTemplateDetail'

const EmailTemplateViewPage = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <EmailTemplateDetail />
            </Grid>
        </Grid>
    )
}

export default EmailTemplateViewPage
