export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui' }}>
        {children}
      </body>
    </html>
  )
}
