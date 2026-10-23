import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import DisclosureStrip from './DisclosureStrip';

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="app-container">
          <Outlet />
        </div>
      </main>
      <DisclosureStrip />
      <Footer />
    </div>
  );
}
