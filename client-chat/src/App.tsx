import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import AuthGuard from './guards/AuthGuard';
import Login from './pages/Login';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>} />
         <Route element={<AuthGuard />}>
          <Route path='/chat' element={<Chat/>} />
          <Route path='*' element={ <Navigate to='/chat' />} />
         </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
