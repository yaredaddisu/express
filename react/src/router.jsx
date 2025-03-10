import { createBrowserRouter } from 'react-router-dom';
import Login from './views/login.jsx';
import Register from './views/register.jsx';
import DefaultLayout from './Components/DefaultLayout.jsx';
import GuestLayout from './Components/GuestLayout.jsx';
import Users from './views/users.jsx';
import UserForm from './views/UserForm.jsx';
import HVACForm from './views/HVACForm.jsx';
import UpdateForm from './views/UpdateForm.jsx';
import Material from './views/Material.jsx';
import ImageUpload from './views/ImageUpload.jsx';
import OrderSlug from './views/OrderSlug.jsx';
import Orders from './views/orders.jsx';
import Jobs from './views/Jobs.jsx';
import JobDetails from './views/JobDetails.jsx';
import AutoLogin from './views/AutoLogin.jsx';
import UserDetails from './views/UserDetails.jsx';
import Profile from './views/Profile.jsx';
import Dashboard from './views/Dashboard.jsx';
import LocationAuthComponent from './Components/LocationAuthComponent.jsx';
import TechLogin from './views/TechLogin.jsx';
import TechnicianDashboard from './views/TechnicianDashboard.jsx';
import TechTasks from './views/TechTasks.jsx';
import ConfirmedTasks from './views/ConfirmedTasks.jsx';
import CompletedJobs from './views/CompletedJobs.jsx';
import CancelJobs from './views/CancelJobs.jsx';
import App from './App.jsx';
import TotalCompletedJobs from './views/TotalCompletedJobs.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/users/new',
        element: <UserForm key="userCreate" />,
      },
      {
        path: '/users-registration/:userId',
        element: <UserDetails key="userUpdate" />,
      },
      {
        path: '/orders/form',
        element: <HVACForm />,
      },
      
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/',
        element: <TechnicianDashboard />,
      },
      {
        path: '/orders/:id',
        element: <UpdateForm />,
      },
      {
        path: '/image',
        element: <ImageUpload />,
      },
      {
        path: '/mat',
        element: <Material />,
      },
      {
        path: '/image/:id',
        element: <ImageUpload />,
      },
      {
        path: '/orders',
        element: <Orders />,
      },
      {
        path: '/jobs',
        element: <Jobs />,
      },
      {
        path: '/jobs/:jobId',
        element: <JobDetails />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
        {
        path: '/tasks',
        element: <TechTasks />,
      },
 {
        path: '/confirmed-tasks',
        element: <ConfirmedTasks />,
      },
       {
        path: '/completed-tasks',
        element: <CompletedJobs/>,
      },
      {
        path: '/cancel-tasks',
        element: <CancelJobs/>,
      },
 {
        path: '/total-completed-tasks',
        element: <TotalCompletedJobs/>,
      },
      
    ],
  },
  {
    path: '/',
    element: <OrderSlug />,
    children: [
      {
        path: '/order-by-slug/:id',
        element: <OrderSlug />,
      },
    ],
  },
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/autoLogin',
        element: <AutoLogin />,
      },
      {
        path: '/tech_login',
        element: <TechLogin />,
      },
    ],
  },
  // Global route for LocationAuthComponent that is available in both authenticated and guest layouts
  {
    path: '/location',
    element: <LocationAuthComponent />,
  },
]);


export default router;
