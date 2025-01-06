import GuestOnlyRoute from '@/hocs/GuestOnlyRoute';
import PropTypes from "prop-types";

const Layout = ({ children, params }) => {
  return <GuestOnlyRoute lang={params.lang}>{children}</GuestOnlyRoute>
}

Layout.propTypes = {
  children: PropTypes.any,
  params: PropTypes.any,
};
export default Layout
