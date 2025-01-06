'use client'
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import FaqHeader from '@views/pages/faq/FaqHeader';
import Faqs from '@views/pages/faq/Faqs';
import FaqFooter from '@views/pages/faq/FaqFooter';
import PropTypes from "prop-types";

const FAQ = ({ data }) => {
  const [searchValue, setSearchValue] = useState('')

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <FaqHeader searchValue={searchValue} setSearchValue={setSearchValue} />
      </Grid>
      <Grid item xs={12}>
        <Faqs faqData={data} searchValue={searchValue} />
      </Grid>
      <Grid item xs={12}>
        <FaqFooter />
      </Grid>
    </Grid>
  )
}

FAQ.propTypes = {
  data: PropTypes.any,
};
export default FAQ
