import Button from '@mui/material/Button';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { IntersectionProvider } from '@/contexts/intersectionContext';
import Providers from '@components/Providers';
import BlankLayout from '@layouts/BlankLayout';
import FrontLayout from '@components/layout/front-pages';
import ScrollToTop from '@core/components/scroll-to-top';
import { getSystemMode } from '@core/utils/serverHelpers';
import '@/app/globals.css';
import '@assets/iconify-icons/generated-icons.css';
import PropTypes from "prop-types";
import axios from 'axios';

export const metadata = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/system-settings`);
  if (response?.data?.result === true) {
    const { systemName, systemImage, description } = response.data.message;
    return {
      title: systemName,
      description,
      icons: {
        icon: systemImage,
      },
    };
  } else if (response?.data?.result === false) {
    console.error('Error fetching system settings:', response.data.error);
  }
};


const Layout = ({ children }) => {
  const systemMode = getSystemMode()

  return (
    <html id='__next'>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <Providers direction='ltr'>
          <BlankLayout systemMode={systemMode}>
            <IntersectionProvider>
              <FrontLayout>
                {children}
                <ScrollToTop className='mui-fixed'>
                  <Button
                    variant='contained'
                    className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
                  >
                    <i className='bx-up-arrow-alt' />
                  </Button>
                </ScrollToTop>
              </FrontLayout>
            </IntersectionProvider>
          </BlankLayout>
        </Providers>
      </body>
    </html>
  )
}

Layout.propTypes = {
  children: PropTypes.any,
};

export default Layout
