export default function Validate(props) {
  if (props === 'The name field is required.') {
    return 'Masukkan nama kegiatan.';
  }
  if (props === 'The target field is required.') {
    return 'Masukkan target.';
  }
  if (props === 'The unit id field is required.') {
    return 'Pilih satuan.';
  }
  if (props === 'The budget field is required.') {
    return 'Masukkan anggaran.';
  }
  if (props === 'The executor id field is required.') {
    return 'Pilih unit pelaksana.';
  }
  if (props === 'The segment field is required.') {
    return 'Masukkan segmen.';
  }
  if (props === 'The segment has already been taken.') {
    return 'Segmen telah digunakan.';
  }
  return props;
}
