
/**
 * @fileOverview Placeholder page for dynamic upgrade routes to satisfy static export requirements.
 * Redirects to the query-parameter based upgrade view.
 */

export function generateStaticParams() {
  // Satisfy Next.js build requirement for static export
  return [{ id: 'view' }];
}

export default function UpgradeIDPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Preparing Upgrade...</h2>
      <p className="text-muted-foreground">Redirecting to the ticket upgrade portal.</p>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            if (id && id !== 'view') {
              window.location.href = '/upgrade-ticket?id=' + id;
            } else {
              window.location.href = '/booking-history';
            }
          `,
        }}
      />
    </div>
  );
}
