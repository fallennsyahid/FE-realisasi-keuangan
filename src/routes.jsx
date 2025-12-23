import { Navigate, useRoutes } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from './store/authentication';
import * as Middleware from './middleware';

import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';

import Login from './pages/Login';
import NotFound from './pages/Page404';

import ProgramStrategis from './pages/ProgramStrategis';
import TopIsu from './pages/TopIsu';
import FormImporPakaianBekas from './pages/ImporPakaianBekas/Form';

import StatistikKoperasi from './pages/StatistikKoperasi';
import StatistikUMKM from './pages/StatistikUMKM';

import RealisasiKeuangan from './pages/RealisasiKeuangan';
import SDMAparatur from './pages/SDMAparatur';
import RecapSDMAparatur from './pages/RecapSDMAparatur';
import Notulensi from './pages/Notulensi';
import DetailNotulensi from './pages/Notulensi/Detail';
import CreateNotulensi from './pages/Notulensi/Create';
import EditNotulensi from './pages/Notulensi/Edit';

import BPJSKesehatan from './pages/BPJSKesehatan';
import CreateBPJSKesehatan from './pages/BPJSKesehatan/Create';
import EditBPJSKesehatan from './pages/BPJSKesehatan/Edit';

export default function Router() {
  const { user } = useRecoilValue(authentication);

  const middlewareIndex = () => {
    if (user !== null) {
      if (user.role === 'bpjs' || user.role === 'view_bpjs') {
        return <Navigate to="/bpjs-kesehatan" />;
      }
      return <Navigate to="/realisasi-keuangan" />;
    }
    return <Navigate to="/login" />;
  };

  return useRoutes([
    {
      path: '/',
      element: (
        <Middleware.After>
          <DashboardLayout />
        </Middleware.After>
      ),
      children: [
        {
          path: '/',
          element: middlewareIndex(),
        },

        { path: 'program-strategis', element: <ProgramStrategis /> },
        {
          path: 'top-isu',
          children: [
            { path: '', element: <TopIsu /> },
            { path: 'impor-pakaian-bekas', element: <FormImporPakaianBekas /> },
          ],
        },

        { path: 'statistik-koperasi', element: <StatistikKoperasi /> },
        { path: 'statistik-umkm', element: <StatistikUMKM /> },

        { path: 'realisasi-keuangan', element: <RealisasiKeuangan /> },
        { path: 'sdm-aparatur', element: <SDMAparatur /> },
        { path: 'sdm-aparatur/rekap', element: <RecapSDMAparatur /> },
        { path: 'notulensi-rapim', element: <Notulensi /> },
        { path: 'notulensi-rapim/:id', element: <DetailNotulensi /> },
        { path: 'notulensi-rapim/create', element: <CreateNotulensi /> },
        { path: 'notulensi-rapim/edit/:id', element: <EditNotulensi /> },

        {
          path: 'bpjs-kesehatan',
          children: [
            { path: '', element: <BPJSKesehatan /> },
            { path: 'create', element: <CreateBPJSKesehatan /> },
            { path: 'edit/:id', element: <EditBPJSKesehatan /> },
          ],
        },
      ],
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        {
          path: 'login',
          element: (
            <Middleware.Before>
              <Login />
            </Middleware.Before>
          ),
        },
        { path: '*', element: <NotFound /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
