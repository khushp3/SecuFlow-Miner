// src/components/Layout.js
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, title = "Dashboard", description = "Security Dashboard" }) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <header>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </header>

      <Header />
      <main className="pt-[60px] xl:pt-[95px] flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
