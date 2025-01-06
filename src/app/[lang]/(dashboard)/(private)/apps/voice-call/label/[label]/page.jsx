import VoiceCallWrapper from '@views/apps/voice-call';
import PropTypes from "prop-types";

const VoiceCallLabelPage = ({ params }) => {
  return <VoiceCallWrapper label={params.label} />
}

VoiceCallLabelPage.propTypes = {
  params: PropTypes.any,
};
export default VoiceCallLabelPage
