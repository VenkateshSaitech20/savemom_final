'use client'
import { useCallback, useEffect, useState } from 'react'
import HeroSection from './HeroSection'
import UsefulFeature from './UsefulFeature'
import CustomerReviews from './CustomerReviews'
import OurTeam from './OurTeam'
import Pricing from './Pricing'
import ProductStat from './ProductStat'
import Faqs from './Faqs'
import GetStarted from './GetStarted'
import ContactUs from './ContactUs'
import { useSettings } from '@core/hooks/useSettings'
import { responseData } from '@/utils/message'
import apiClient from '@/utils/apiClient'
import Loader from '@/components/loader'
import PropTypes from "prop-types";

const LandingPageWrapper = ({ mode }) => {
  const { updatePageSettings } = useSettings()
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
  }, [])

  const formatData = (rawData) => {
    return rawData.reduce((acc, item) => {
      acc[item.sectionType] = item;
      return acc;
    }, {});
  }

  const GetSectionData = useCallback(async () => {
    setIsLoading(true);
    const response = await apiClient.get('/api/website-settings/section-content/get-all');
    if (response?.data?.result === true) {
      const formattedData = formatData(response.data.message);
      setData(formattedData);
    }
    else if (response?.data?.result === false) {
      if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
        await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
        sessionStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    GetSectionData();
  }, [GetSectionData]);

  return (
    <>
      {isLoading && <div className='my-4'><Loader /></div>}
      {!isLoading && (
        <div className='bg-backgroundPaper'>
          {data['banner_section']?.isfrontendvisible === "Y" && (<HeroSection mode={mode} data={data['banner_section']} />)}
          {data['feature']?.isfrontendvisible === "Y" && (<UsefulFeature data={data['feature']} />)}
          {(data['testimonial']?.isfrontendvisible === "Y" || data['brand']?.isfrontendvisible === "Y") && (<CustomerReviews data={data['testimonial']} brand={data['brand']} />)}
          {data['our_team']?.isfrontendvisible === "Y" && (<OurTeam data={data['our_team']} />)}
          {data['plans']?.isfrontendvisible === "Y" && (<Pricing data={data['plans']} />)}
          {data['key_achievements']?.isfrontendvisible === "Y" && (<ProductStat data={data['key_achievements']} />)}
          {data['faq']?.isfrontendvisible === "Y" && (<Faqs data={data['faq']} />)}
          <GetStarted mode={mode} />
          <ContactUs />
        </div>
      )}
    </>
  )
}

LandingPageWrapper.propTypes = {
  mode: PropTypes.any,
};
export default LandingPageWrapper
