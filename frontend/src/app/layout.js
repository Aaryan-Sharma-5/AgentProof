import "./globals.css";

export const metadata = {
  title: "AgentProof",
  description: "Spend by policy. Work autonomously. Get paid by proof.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
