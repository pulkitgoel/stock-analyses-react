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
      {/* The mobile dock is a flush fixed bar, so without this the last ~57px of
          every page - the tail of the footer - sits underneath it and cannot be
          scrolled into view. Measured on the live site: dock top 783, last
          element bottom 840 at 390x844. Desktop has no dock, hence md:hidden. */}
      <div
        className="md:hidden"
        aria-hidden="true"
        style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
      />
    </div>
  );
}
