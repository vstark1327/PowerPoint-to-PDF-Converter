import './globals.css';

export const metadata = {
  title: 'PowerPoint to PDF converter - SlideSpeak',
  description: 'Convert your PowerPoint file to PDF with ease.',
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
