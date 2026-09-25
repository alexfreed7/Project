import "./globals.css";

export const metadata = {
  title: "Ready Check",
  description: "See who's ready to go, in real time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
