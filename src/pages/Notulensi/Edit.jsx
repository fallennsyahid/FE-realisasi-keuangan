import { useParams } from 'react-router-dom';
import FormNotulensi from './Form';

export default function EditNotulensi() {
  const { id } = useParams();
  return <FormNotulensi id={id} />;
}
