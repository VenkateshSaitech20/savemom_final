import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Check from '@assets/svg/front-pages/landing-page/Check';
import User from '@assets/svg/front-pages/landing-page/User';
import LaptopCharging from '@assets/svg/front-pages/landing-page/LaptopCharging';
import Diamond from '@assets/svg/front-pages/landing-page/Diamond';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';

const ProductStat = () => {
  const [keyAchievements, setKeyAchievements] = useState([]);;
  const [isLoading, setIsLoading] = useState(false);

  const getKeyAchievements = async () => {
    setIsLoading(true);
    const response = await apiClient.get(`/api/website-settings/key-achievement`);
    if (response?.data?.result === true) {
      if (response?.data?.message) {
        setKeyAchievements(response.data.message);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getKeyAchievements();
  }, [])

  return (
    <>
      {isLoading && <Loader />}
      {
        !isLoading && (
          <section className='plb-16'>
            <div className={frontCommonStyles.layoutSpacing}>
              <Grid container spacing={6}>
                {keyAchievements?.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <div className='flex flex-col items-center justify-center gap-4 p-6 border rounded' style={{ borderColor: "var(--mui-palette-info-darkerOpacity)" }}>
                      {
                        item?.image ? (<img height={60} width={60} src={item.image} alt="icon" />) : (
                          <LaptopCharging color='var(--mui-palette-primary-main)' />
                        )
                      }
                      <div className='flex flex-col gap-0.5 text-center'>
                        <Typography variant='h3'>{item?.keyMetric}</Typography>
                        <Typography className='font-medium'>{item?.highlight}</Typography>
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </div>
          </section>
        )
      }
    </>
  )
}

export default ProductStat
