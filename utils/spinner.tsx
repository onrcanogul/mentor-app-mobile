import React from "react";
import Spinner from "react-native-loading-spinner-overlay";

interface Props {
  visible: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<Props> = ({ visible, text }) => {
  return (
    <Spinner
      visible={visible}
      textContent={text}
      textStyle={{ color: "#FFFFFF" }}
      overlayColor="rgba(18, 18, 18, 0.95)" // daha koyu ve opak
      color="#FFFFFF"
      animation="fade"
    />
  );
};

export default LoadingSpinner;
