import { Header } from './header';
import { HomeBanner } from './home-banner';
import { CategoryTabs } from './category-tabs';
import { MobileNav } from './mobile-nav';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <HomeBanner />
      <CategoryTabs />
      <main className="mx-auto w-full max-w-screen-xl flex-1 overflow-auto px-3 pt-6 pb-20 md:px-4 md:pt-8 md:pb-4">
        {children}
      </main>
      <MobileNav className="fixed bottom-0 left-0 right-0 z-header md:hidden" />
    </div>
  );
}
