import Grid from '@mui/material/Grid';
import LanguageList from './LanguageList';
import SelectLanguage from './SelectLanguage';

const Account = () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <SelectLanguage />
            </Grid>
            <Grid item xs={12}>
                <LanguageList />
            </Grid>
        </Grid>
    )
}

export default Account
