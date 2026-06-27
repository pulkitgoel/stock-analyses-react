import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-3 sm:px-6 py-5 sm:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
