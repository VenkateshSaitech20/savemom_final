import WhatsAppWrapper from '@views/apps/whats-app';
import PropTypes from "prop-types";

const WhatsAppLabelPage = ({ params }) => {
  return <WhatsAppWrapper label={params.label} />
}

WhatsAppLabelPage.propTypes = {
  params: PropTypes.any,
};
export default WhatsAppLabelPage
