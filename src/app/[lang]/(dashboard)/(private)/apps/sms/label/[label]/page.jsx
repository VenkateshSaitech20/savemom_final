import SMSWrapper from '@views/apps/sms';
import PropTypes from "prop-types";

const SMSLabelPage = ({ params }) => {
  return <SMSWrapper label={params.label} />
}

SMSLabelPage.propTypes = {
  params: PropTypes.any,
};
export default SMSLabelPage
