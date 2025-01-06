import Providers from '@components/Providers';
import BlankLayout from '@layouts/BlankLayout';
import PropTypes from "prop-types";
import { i18n } from '@configs/i18n';
import { getSystemMode } from '@core/utils/serverHelpers';

const Layout = ({ children, params }) => {
  const direction = i18n.langDirection[params.lang]
  const systemMode = getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </Providers>
  )
}

Layout.propTypes = {
  children: PropTypes.any,
  params: PropTypes.any,
};
export default Layout
