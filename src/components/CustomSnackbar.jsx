import { Snackbar } from '@mui/material';

export default function CustomSnackbar(props) {
  const { snackbar, message, handleSnackbar } = props;
  return <Snackbar open={snackbar} message={message} onClose={handleSnackbar} autoHideDuration={6000} />;
}
