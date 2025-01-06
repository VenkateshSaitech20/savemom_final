import EmailWrapper from '@views/apps/email';
import PropTypes from "prop-types";

const EmailLabelPage = ({ params }) => {
  return <EmailWrapper label={params.label} />
}

EmailLabelPage.propTypes = {
  params: PropTypes.any,
};
export default EmailLabelPage
