import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import classnames from 'classnames';
import CustomAvatar from '@core/components/mui/Avatar';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import { getLocalizedUrl } from '@/utils/i18n';
import { useParams, useRouter } from 'next/navigation';
import PropTypes from "prop-types";

const PricingPlan = ({ data }) => {
  const [pricingPlan, setPricingPlan] = useState('annually');
  const [planList, setPlanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const { lang: locale } = useParams();
  const locale = 'en';
  const getData = useCallback(async () => {
    setIsLoading(true);
    const response = await apiClient.get('/api/website-settings/package-plans');
    if (response?.data?.result) {
      setPlanList(response?.data?.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const handleChange = e => {
    if (e.target.checked) {
      setPricingPlan('annually')
    } else {
      setPricingPlan('monthly')
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && (
        <section
          id='pricing-plans'
          className={'flex flex-col gap-8 lg:gap-12 plb-[100px] bg-backgroundDefault rounded-[60px]'}
        >
          <div className={classnames('is-full', frontCommonStyles.layoutSpacing)}>
            <div className='flex flex-col items-center justify-center gap-4 mbe-4'>
              <Chip size='small' variant='tonal' color='primary' label={data?.badgeTitle} />
              <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
                <Typography variant='h4'>
                  <span className='relative z-[1] font-extrabold'>
                    {data?.title}
                    <img
                      src='/images/front-pages/landing-page/bg-shape.png'
                      alt='bg-shape'
                      className='absolute block-end-0 z-[1] bs-[40%] is-[125%] sm:is-[132%] -inline-start-[10%] sm:inline-start-[-19%] block-start-[17px]'
                    />
                  </span>
                </Typography>
                <Typography>
                  {data?.description}
                </Typography>
              </div>
            </div>
            <div className='flex justify-center items-center gap-3 max-sm:mlb-4 mbe-11'>
              <InputLabel htmlFor='pricing-switch' className='cursor-pointer'>
                Pay Monthly
              </InputLabel>
              <Switch id='pricing-switch' onChange={handleChange} checked={pricingPlan === 'annually'} />
              <InputLabel htmlFor='pricing-switch' className='cursor-pointer'>
                Pay Annually
              </InputLabel>
              <div className='flex gap-x-1 items-start max-sm:hidden mbe-5'>
                <img src='/images/front-pages/landing-page/pricing-arrow.png' alt='arrow image' width='50' />
                <Typography className='font-medium'>Save {data?.discount}%</Typography>
              </div>
            </div>
            <Grid container spacing={6}>
              {planList?.map((plan) => (
                <Grid item key={plan.id} xs={12} lg={4}>
                  <Card className={classnames({ 'border-2 border-primary shadow-xl': plan.popularPlan === "Y" })}>
                    <CardContent className='flex flex-col gap-8 p-8 pbs-12'>
                      <div className='is-full flex flex-col items-center gap-3'>
                        <img src={plan.image} alt={plan.image} height='88' width='86' className='text-center' />
                      </div>
                      <div className='flex flex-col items-center gap-0.5 plb-2.5 relative'>
                        <Typography className='text-center' variant='h4'>
                          {plan.title}
                        </Typography>
                        <Typography className='text-center' variant='h6'>
                          {plan.subTitle}
                        </Typography>
                        <div className='flex items-baseline gap-1'>
                          <Typography variant='h2' color='primary' className='font-extrabold'>
                            &#8377;{pricingPlan === 'monthly' ? plan.monthlyPrice : plan.yearlyPlan.monthly}
                          </Typography>
                          <Typography color='text.disabled' className='font-medium'>
                            /mo
                          </Typography>
                        </div>
                        {pricingPlan === 'annually' && (
                          <Typography variant='caption' className='absolute block-end-[-9px]'>
                            &#8377;{plan.yearlyPlan.annually} / year
                          </Typography>
                        )}
                      </div>
                      <div>
                        <div className='flex flex-col gap-3'>
                          {plan.planBenefits.map((plan) => (
                            <div key={plan} className='flex items-center gap-2.5'>
                              {/* <CustomAvatar color='primary' skin={plan.current ? 'filled' : 'light'} size={16}> */}
                              <CustomAvatar color='primary' skin={'light'} size={16}>
                                <i className='bx-check text-xs' />
                              </CustomAvatar>
                              <Typography variant='h6'>{plan.feature}</Typography>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* <Button component={Link} href='/front-pages/payment' variant={plan.current ? 'contained' : 'tonal'}> */}
                      <Button component={Link} href={getLocalizedUrl('/pages/my-plan', locale)} variant={plan.current ? 'contained' : 'tonal'}>
                        {/* <Button onClick={handleButtonClick} variant={'contained'}> */}
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </section>
      )}
    </>

  )
}

PricingPlan.propTypes = {
  data: PropTypes.any,
};
export default PricingPlan
