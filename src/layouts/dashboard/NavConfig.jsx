import {
  SignalCellularAltRounded,
  DonutLargeRounded,
  GroupsRounded,
  StarRounded,
  TodayRounded,
  SyncAltRounded,
} from '@mui/icons-material';

const navConfig = [
  {
    child: [
      {
        title: 'Program Strategis',
        path: '/program-strategis',
        icon: <StarRounded />,
        role: ['superadmin', 'realisasi', 'sdm', 'biro_mkos', 'notulensi', 'unit', 'rapim', 'view_only'],
      },
      {
        title: 'Top Isu',
        path: '/top-isu',
        icon: <StarRounded />,
        role: [
          'superadmin',
          'realisasi',
          'sdm',
          'biro_mkos',
          'notulensi',
          'unit',
          'rapim',
          'view_only',
          'view_kemenkeu',
        ],
      },
    ],
  },
  {
    child: [
      {
        title: 'Statistik Koperasi',
        path: '/statistik-koperasi',
        icon: <DonutLargeRounded />,
        role: [
          'superadmin',
          'realisasi',
          'sdm',
          'biro_mkos',
          'notulensi',
          'unit',
          'rapim',
          'view_only',
          'view_kemenkeu',
        ],
      },
      // {
      //   title: 'Statistik UMKM',
      //   path: '/statistik-umkm',
      //   icon: <DonutLargeRounded />,
      //   role: ['superadmin', 'realisasi', 'sdm', 'biro_mkos', 'notulensi', 'unit', 'rapim', 'view_only'],
      // },
    ],
  },
  {
    child: [
      {
        title: 'Realisasi Keuangan',
        path: '/realisasi-keuangan',
        icon: <SignalCellularAltRounded />,
        role: [
          'superadmin',
          'realisasi',
          'sdm',
          'biro_mkos',
          'notulensi',
          'unit',
          'rapim',
          'view_only',
          'view_kemenkeu',
        ],
      },
      {
        title: 'SDM Aparatur',
        path: '/sdm-aparatur',
        icon: <GroupsRounded />,
        role: [
          'superadmin',
          'realisasi',
          'sdm',
          'biro_mkos',
          'notulensi',
          'unit',
          'rapim',
          'view_only',
          'view_kemenkeu',
        ],
      },
      {
        title: 'Notulensi Rapim',
        path: '/notulensi-rapim',
        icon: <TodayRounded />,
        role: [
          'superadmin',
          'realisasi',
          'sdm',
          'biro_mkos',
          'notulensi',
          'unit',
          'rapim',
          'view_only',
          'view_kemenkeu',
        ],
      },
    ],
  },
  {
    child: [
      {
        title: 'Integrasi BPJS Kesehatan',
        path: '/bpjs-kesehatan',
        icon: <SyncAltRounded />,
        role: ['superadmin', 'bpjs', 'view_only', 'view_kemenkeu', 'view_bpjs'],
      },
    ],
  },
];

export default navConfig;
