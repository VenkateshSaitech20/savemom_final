import { headers } from 'next/headers';
import 'react-perfect-scrollbar/dist/css/styles.css';
import TranslationWrapper from '@/hocs/TranslationWrapper';
import { i18n } from '@configs/i18n';
import '@/app/globals.css';
import '@assets/iconify-icons/generated-icons.css';
import axios from 'axios';
import PropTypes from "prop-types";

export const metadata = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/system-settings`);
  if (response?.data?.result === true) {
    const { metaTitle, systemImage, description } = response.data.message;
    return {
      title: metaTitle,
      description,
      icons: {
        icon: systemImage,
      },
    };
  } else if (response?.data?.result === false) {
    console.error('Error fetching system settings:', response.data.error);
  }
};

const RootLayout = ({ children, params }) => {

  const headersList = headers()
  const direction = i18n.langDirection[params.lang]
  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction}>
        <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
      </html>
    </TranslationWrapper>
  )
}

RootLayout.propTypes = {
  children: PropTypes.any,
  params: PropTypes.any,
};
export default RootLayout
